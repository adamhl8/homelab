#!/usr/bin/env bun
import { Buffer } from "node:buffer"
import { rmSync } from "node:fs"
import { chmod, mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { parseArgs } from "node:util"

import { type } from "arktype"
import bun, { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr, messageChain } from "ts-explicit-errors"

import { secret } from "#hosts/lib/sops.ts"

const IMAGE = "ghcr.io/cirruslabs/macos-tahoe-vanilla:latest"
const VM_NAME = "homelab-recovery-test"
const VM_DISK = path.join(os.homedir(), ".tart/vms", VM_NAME, "disk.img")
const DISK_SIZE_GB = 120
const MIN_FREE_GB_CACHED = 40
// Add the size `tart list` reports for the image, which overstates a pull's real cost because the image is sparse.
const MIN_FREE_GB_UNCACHED = MIN_FREE_GB_CACHED + 27
// Keep `ONE_LINER` identical to the one in README.md, because it's the path under test.
const ONE_LINER = `sh -c "$(curl -fsSL https://raw.githubusercontent.com/adamhl8/homelab/main/bootstrap.sh)"`
// Keep `APPLY_COMMAND` identical to the one bootstrap.sh prints.
const APPLY_COMMAND = `cd ~/homelab && eval "$(/opt/homebrew/bin/brew shellenv)" && bunx bask apply macbook`
// Stop the VM if this Mac drops below `HOST_FLOOR_GB` free, because the VM's disk grows into the host's.
const HOST_FLOOR_GB = 15
const DISK_CHECK_INTERVAL_MS = 10_000
const SSH_TIMEOUT_MS = 300_000
const POLL_INTERVAL_MS = 3000
const VANILLA_PASSWORD = "admin"
// macOS obfuscates the auto-login password in `/etc/kcpassword` by XOR with this key.
const KCPASSWORD_KEY = [0x7d, 0x89, 0x52, 0x23, 0xd2, 0xbc, 0xdd, 0xea, 0xa3, 0xb9, 0x1f]
const DELETE_COMMAND = `tart stop ${VM_NAME}; tart delete ${VM_NAME}`
const CLEANUP_HINT = `The VM is still up and holds real secrets. Delete it with: ${DELETE_COMMAND}`

const SSH_COMMON = [
  "-o",
  "StrictHostKeyChecking=no",
  "-o",
  "UserKnownHostsFile=/dev/null",
  "-o",
  "ConnectTimeout=5",
  "-o",
  "LogLevel=ERROR",
  // Offer only the `-i` key, because sshd stops after a few keys from a full agent.
  "-o",
  "IdentitiesOnly=yes",
  // Drop a session whose sshd stops answering, like one caught by a reboot.
  "-o",
  "ServerAliveInterval=5",
  "-o",
  "ServerAliveCountMax=3",
]

const WHITESPACE = /\s+/v

const TartVms = type({ Name: "string", Source: "string" }).array()

type User = "admin" | "adam"

interface Vm {
  ip: string
  /** The ssh options that log in with the ephemeral key */
  ssh: string[]
}

interface Step {
  name: string
  code: number
}

const sleep = async (ms: number) => bun.sleep(ms)

/** Polls `check` until it returns true, or fails after `SSH_TIMEOUT_MS` */
const poll = async (what: string, check: () => Promise<boolean>): Promise<Result> => {
  const deadline = Date.now() + SSH_TIMEOUT_MS
  while (Date.now() < deadline) {
    // oxlint-disable-next-line no-await-in-loop -- each check has to finish before the next one starts
    if (await check()) return
    // oxlint-disable-next-line no-await-in-loop -- the wait between checks is the point
    await sleep(POLL_INTERVAL_MS)
  }
  return err(`timed out after ${SSH_TIMEOUT_MS / 1000}s waiting for ${what}`, undefined)
}

const readFreeGb = async (): Promise<Result<number>> => {
  const df = await attempt(async () => $`df -k /`.quiet().text())
  if (isErr(df)) return err("failed to read free disk space", df)
  const availableKb = Number(df.trim().split("\n").at(-1)?.split(WHITESPACE)[3])
  if (Number.isNaN(availableKb)) return err(`failed to parse 'df -k /':\n${df}`, undefined)
  return Math.floor(availableKb / 1024 / 1024)
}

/** Stops the VM if this Mac runs low on disk, and returns a function that stops watching */
const watchHostDisk = (): (() => void) => {
  let hasStopped = false
  const check = async () => {
    if (hasStopped) return
    const freeGb = await readFreeGb()
    if (isErr(freeGb) || freeGb >= HOST_FLOOR_GB) return
    hasStopped = true
    console.error(
      `\nThis Mac is down to ${freeGb} GB free, so the VM is being stopped. Delete it with: ${DELETE_COMMAND}`,
    )
    await $`tart stop ${VM_NAME}`.nothrow().quiet()
  }
  const timer = setInterval(() => void check(), DISK_CHECK_INTERVAL_MS)
  return () => {
    clearInterval(timer)
  }
}

const checkPreconditions = async (): Promise<Result> => {
  const listing = await attempt(async () => TartVms.assert(await $`tart list --format json`.quiet().json()))
  if (isErr(listing)) return err("failed to list Tart VMs", listing)

  if (listing.some((vm) => vm.Source === "local" && vm.Name === VM_NAME)) {
    return err(
      `'${VM_NAME}' already exists from an earlier run and may hold secrets. Delete it with: ${DELETE_COMMAND}`,
      undefined,
    )
  }

  const isCached = listing.some((vm) => vm.Source === "OCI" && vm.Name === IMAGE)
  const requiredGb = isCached ? MIN_FREE_GB_CACHED : MIN_FREE_GB_UNCACHED

  const freeGb = await readFreeGb()
  if (isErr(freeGb)) return freeGb
  if (freeGb < requiredGb) {
    return err(
      `need ${requiredGb} GB free on / (image ${isCached ? "cached" : "not cached"}), have ${freeGb} GB`,
      undefined,
    )
  }
}

/** Encodes `password` the way loginwindow reads it from `/etc/kcpassword` */
const kcpassword = (password: string): Buffer => {
  const bytes = Buffer.from(password)
  // Pad with at least one NUL to a multiple of 12, like macOS does.
  const encoded = Buffer.alloc(Math.ceil((bytes.length + 1) / 12) * 12)
  for (const [index] of encoded.entries())
    // oxlint-disable-next-line no-bitwise -- the kcpassword format is an XOR
    encoded[index] = (bytes[index] ?? 0) ^ (KCPASSWORD_KEY[index % KCPASSWORD_KEY.length] ?? 0)
  return encoded
}

/** Runs `command` in the VM without a terminal, as admin unless `as` says otherwise, and returns its stdout */
const vmSh = async (
  vm: Vm,
  command: string,
  { as: user = "admin", stdin = "" }: { as?: User; stdin?: string | Buffer } = {},
): Promise<Result<string>> => {
  const output = await attempt(async () =>
    $`ssh ${vm.ssh} ${user}@${vm.ip} ${command} < ${Buffer.from(stdin)}`.quiet().text(),
  )
  if (isErr(output)) return err(`failed to run '${command}' as ${user} in the VM`, output)
  return output
}

/** Runs `command` in the VM as adam on this terminal, so prompts reach the person running the test */
const vmInteractive = async (vm: Vm, command: string): Promise<number> => {
  const subprocess = bun.spawn(["ssh", "-t", ...vm.ssh, `adam@${vm.ip}`, command], {
    stdio: ["inherit", "inherit", "inherit"],
  })
  return subprocess.exited
}

const canSsh = async (vm: Vm, user: User): Promise<boolean> =>
  (await $`ssh ${vm.ssh} ${user}@${vm.ip} true`.nothrow().quiet()).exitCode === 0

const readIp = async (): Promise<Result<string>> => {
  const ip = await attempt(async () => $`tart ip ${VM_NAME} --wait 180`.quiet().text())
  if (isErr(ip)) return err(`failed to get the IP of '${VM_NAME}'`, ip)
  return ip.trim()
}

/** Clones the image, grows its disk, and boots it with a window */
const createVm = async (): Promise<Result> => {
  console.info(`Cloning ${IMAGE} to ${VM_NAME}...`)
  const cloned = await attempt(async () => {
    await $`tart clone ${IMAGE} ${VM_NAME}`
    await $`tart set ${VM_NAME} --disk-size ${DISK_SIZE_GB}`
  })
  if (isErr(cloned)) return err(`failed to create '${VM_NAME}'`, cloned)

  // Delete the recovery partition because it sits right after the system container and blocks growing it.
  // `diskutil` refuses to delete it (SIP), so edit the image's partition table while the VM is stopped.
  const recovery = await attempt(async () => $`sgdisk --info=3 ${VM_DISK}`.quiet().text())
  if (isErr(recovery)) return err("failed to read the VM's partition table", recovery)
  if (!recovery.includes("Partition name: 'RecoveryOSContainer'"))
    return err(`partition 3 of '${VM_DISK}' is not the recovery partition:\n${recovery}`, undefined)
  const deleted = await attempt(async () => $`sgdisk --delete=3 ${VM_DISK}`.quiet())
  if (isErr(deleted)) return err("failed to delete the VM's recovery partition", deleted)

  // Detach `tart run` so a failed or interrupted test leaves the VM up for inspection.
  bun.spawn(["tart", "run", VM_NAME], { stdio: ["ignore", "ignore", "ignore"], detached: true }).unref()
}

/** Logs in as the image's `admin` with its password, once, to install the ephemeral key */
const authorizeAdminKey = async (ip: string, askpass: string, publicKey: string): Promise<Result> => {
  const env = { ...process.env, SSH_ASKPASS: askpass, SSH_ASKPASS_REQUIRE: "force", DISPLAY: ":0" }
  const command =
    "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
  return poll("SSH as admin", async () => {
    const result =
      await $`ssh -o PubkeyAuthentication=no ${SSH_COMMON} admin@${ip} ${command} < ${Buffer.from(publicKey)}`
        .env(env)
        .nothrow()
        .quiet()
    return result.exitCode === 0
  })
}

/** Grows the system container, creates `adam` with auto-login, and reboots into adam's session */
const setUpAdam = async (vm: Vm, publicKey: string): Promise<Result<Vm>> => {
  console.info("Growing the VM's disk and creating adam...")
  const password = await attempt(async () => secret("homelab_password"))
  if (isErr(password)) return err("failed to decrypt 'homelab_password'", password)

  const commands: [string, string | Buffer][] = [
    ["sudo -n diskutil apfs resizeContainer disk0s2 0", ""],
    ['sudo -n sysadminctl -addUser adam -fullName "Adam Langbert" -password - -admin', `${password}\n`],
    // Write auto-login by hand because `sysadminctl -autologin` fails to write `/etc/kcpassword` on macOS 26.
    ["sudo -n defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser adam", ""],
    [
      "sudo -n tee /etc/kcpassword >/dev/null && sudo -n chown root:wheel /etc/kcpassword && sudo -n chmod 600 /etc/kcpassword",
      kcpassword(password),
    ],
    [
      "sudo -n mkdir -p /Users/adam/.ssh && sudo -n tee /Users/adam/.ssh/authorized_keys >/dev/null && sudo -n chown -R adam:staff /Users/adam/.ssh && sudo -n chmod 700 /Users/adam/.ssh && sudo -n chmod 600 /Users/adam/.ssh/authorized_keys",
      publicKey,
    ],
    // Add `adam` to the SSH service ACL directly because sshd can miss membership through the nested `admin` group.
    ["sudo -n dseditgroup -o edit -a adam -t user com.apple.access_ssh", ""],
  ]
  for (const [command, stdin] of commands) {
    // oxlint-disable-next-line no-await-in-loop -- each setup command depends on the one before it
    const result = await vmSh(vm, command, { stdin })
    if (isErr(result)) return result
  }

  console.info("Rebooting into adam's session...")
  // Background `shutdown` so the SSH session can close before sshd goes away.
  await $`ssh ${vm.ssh} admin@${vm.ip} ${"(sudo -n shutdown -r now >/dev/null 2>&1 &)"}`.nothrow().quiet()

  // Wait for SSH to drop first, because the old sshd answers for a moment after `shutdown`.
  const down = await poll("the VM to go down for the reboot", async () => !(await canSsh(vm, "admin")))
  if (isErr(down)) return down

  const ip = await readIp()
  if (isErr(ip)) return ip
  const rebooted = { ...vm, ip }

  const adminUp = await poll("SSH as admin after the reboot", async () => canSsh(rebooted, "admin"))
  if (isErr(adminUp)) return adminUp
  // Flush the membership cache because it kept a stale "adam can't use SSH" answer across the reboot.
  const flushed = await vmSh(rebooted, "sudo -n dsmemberutil flushcache")
  if (isErr(flushed)) return flushed

  const up = await poll("SSH as adam after the reboot", async () => canSsh(rebooted, "adam"))
  if (isErr(up)) return up

  const loggedIn = await poll("adam to own the GUI session", async () => {
    const owner = await vmSh(rebooted, "stat -f %Su /dev/console", { as: "adam" })
    return !isErr(owner) && owner.trim() === "adam"
  })
  if (isErr(loggedIn)) return err("auto-login didn't put adam on the console", loggedIn)

  // Check that adam has to type a password for sudo, like on a real Mac, or bootstrap could pass falsely.
  const sudo = await $`ssh ${rebooted.ssh} adam@${rebooted.ip} ${"sudo -n true"}`.nothrow().quiet()
  if (sudo.exitCode === 0) return err("adam has passwordless sudo in the VM, which a real Mac doesn't", undefined)

  return rebooted
}

/** Runs the documented recovery path as adam, stopping at the first step that fails */
const recover = async (vm: Vm): Promise<Step[]> => {
  const steps: Step[] = []

  console.info(`\nRunning the bootstrap one-liner as adam. Type the passphrase when asked.\n$ ${ONE_LINER}\n`)
  // Run in a login shell, like pasting into a new Terminal window.
  steps.push({ name: "bootstrap", code: await vmInteractive(vm, `zsh -l -i -c '${ONE_LINER}'`) })
  if (steps.at(-1)?.code !== 0) return steps

  // oxlint-disable-next-line no-alert -- Bun's `prompt` reads a line from the terminal
  prompt("\nSign into the App Store in the VM window if you want Mac App Store installs tested, then press Enter.")

  // Run in a fresh login shell with no PATH help, so the printed command has to bring its own.
  console.info(`\n$ ${APPLY_COMMAND}\n`)
  steps.push({ name: "apply", code: await vmInteractive(vm, `zsh -l -i -c '${APPLY_COMMAND}'`) })
  if (steps.at(-1)?.code !== 0) return steps

  // Read the login shell back because the apply switches it to fish.
  const shellRecord = await vmSh(vm, "dscl . -read /Users/adam UserShell", { as: "adam" })
  const shell = isErr(shellRecord) ? "/bin/zsh" : shellRecord.replace("UserShell:", "").trim()
  const planCommand = "cd ~/homelab && bask plan macbook"
  console.info(`\n$ ${planCommand}    (in ${shell})\n`)
  steps.push({ name: "plan", code: await vmInteractive(vm, `${shell} -l -i -c '${planCommand}'`) })

  return steps
}

const printVerdict = (steps: Step[], startedAt: number) => {
  const minutes = Math.round((Date.now() - startedAt) / 60_000)
  const describe = (step: Step) => {
    if (step.name === "plan" && step.code === 2) return "drift"
    return step.code === 0 ? "ok" : `failed (exit ${step.code})`
  }
  console.info(`\n=== Recovery test verdict (${minutes} min) ===`)
  for (const name of ["bootstrap", "apply", "plan"]) {
    const step = steps.find((candidate) => candidate.name === name)
    console.info(`  ${name.padEnd(10)} ${step ? describe(step) : "not run"}`)
  }
}

const deleteVm = async (): Promise<Result> => {
  await $`tart stop ${VM_NAME}`.nothrow().quiet()
  const deleted = await attempt(async () => $`tart delete ${VM_NAME}`.quiet())
  if (isErr(deleted)) return err(`failed to delete '${VM_NAME}'`, deleted)
}

/** Asks whether to delete the VM after a failure, and keeps it for inspection unless the answer is yes */
const offerDelete = async () => {
  // oxlint-disable-next-line no-alert -- Bun's `prompt` reads a line from the terminal
  const answer = prompt(`\nDelete '${VM_NAME}' now? Anything but yes keeps it for inspection. [y/N]`)
  if (!["y", "yes"].includes(answer?.trim().toLowerCase() ?? "")) {
    console.error(CLEANUP_HINT)
    return
  }
  const deleted = await deleteVm()
  if (isErr(deleted)) {
    console.error(messageChain(deleted))
    console.error(CLEANUP_HINT)
    return
  }
  console.info(`Deleted '${VM_NAME}'.`)
}

interface KeyFiles {
  key: string
  askpass: string
  publicKey: string
}

const runInVm = async ({ key, askpass, publicKey }: KeyFiles, keep: boolean): Promise<number> => {
  const setUp = async (): Promise<Result<Vm>> => {
    const ip = await readIp()
    if (isErr(ip)) return ip
    const authorized = await authorizeAdminKey(ip, askpass, publicKey)
    if (isErr(authorized)) return authorized
    return setUpAdam({ ip, ssh: ["-i", key, "-o", "BatchMode=yes", ...SSH_COMMON] }, publicKey)
  }
  const vm = await setUp()
  if (isErr(vm)) {
    console.error(messageChain(vm))
    await offerDelete()
    return 1
  }

  const startedAt = Date.now()
  const steps = await recover(vm)
  printVerdict(steps, startedAt)

  const failed = steps.find((step) => step.code !== 0)
  if (failed) {
    await offerDelete()
    return failed.code
  }

  if (keep) {
    console.info(`\nKept '${VM_NAME}' (--keep). ${CLEANUP_HINT}`)
    return 0
  }
  console.info(`\nDeleting '${VM_NAME}'...`)
  const deleted = await deleteVm()
  if (isErr(deleted)) {
    console.error(messageChain(deleted))
    console.error(CLEANUP_HINT)
    return 1
  }
  return 0
}

const run = async (dir: string, keep: boolean): Promise<number> => {
  const key = path.join(dir, "id_ed25519")
  const askpass = path.join(dir, "askpass")
  const prepared = await attempt(async () => {
    await $`ssh-keygen -q -t ed25519 -N ${""} -f ${key} -C vm-test`
    await bun.write(askpass, `#!/bin/sh\necho ${VANILLA_PASSWORD}\n`)
    await chmod(askpass, 0o700)
    return bun.file(`${key}.pub`).text()
  })
  if (isErr(prepared)) {
    console.error(messageChain(err("failed to create the ephemeral SSH key", prepared)))
    return 1
  }

  const created = await createVm()
  if (isErr(created)) {
    console.error(messageChain(created))
    await offerDelete()
    return 1
  }
  const stopWatching = watchHostDisk()
  try {
    return await runInVm({ key, askpass, publicKey: prepared }, keep)
  } finally {
    stopWatching()
  }
}

const main = async (): Promise<number> => {
  const { values } = parseArgs({ options: { keep: { type: "boolean", default: false } } })

  const preconditions = await checkPreconditions()
  if (isErr(preconditions)) {
    console.error(messageChain(preconditions))
    return 1
  }

  const dir = await mkdtemp(path.join(os.tmpdir(), "vm-test-"))
  process.on("SIGINT", () => {
    rmSync(dir, { recursive: true, force: true })
    console.error(`\nInterrupted. ${CLEANUP_HINT}`)
    process.exit(130)
  })

  try {
    return await run(dir, values.keep)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

process.exitCode = await main()
