#!/usr/bin/env bun
import { Buffer } from "node:buffer"
import { rmSync } from "node:fs"
import { chmod, mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"

import { type } from "arktype"
import bun, { $ } from "bun"
import type { Subprocess } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr, messageChain } from "ts-explicit-errors"

import { REPO } from "#hosts/lib/paths.ts"
import { secret } from "#hosts/lib/sops.ts"
import { BREW_PACKAGES } from "#hosts/macbook/brew.ts"

const IMAGE = "ghcr.io/cirruslabs/macos-tahoe-vanilla:latest"
const VM_NAME = "homelab-recovery-test"
const VM_DISK = path.join(os.homedir(), ".tart/vms", VM_NAME, "disk.img")
const DISK_SIZE_GB = 120
const MIN_FREE_GB_CACHED = 40
// Add the size `tart list` reports for the image, which overstates a pull's real cost because the image is sparse.
const MIN_FREE_GB_UNCACHED = MIN_FREE_GB_CACHED + 27
// Stop the VM if this Mac drops below `HOST_FLOOR_GB` free, because the VM's disk grows into the host's.
const HOST_FLOOR_GB = 15
const DISK_CHECK_INTERVAL_MS = 10_000
const SSH_TIMEOUT_MS = 300_000
const POLL_INTERVAL_MS = 3000
const VANILLA_PASSWORD = "admin"
// macOS obfuscates the auto-login password in `/etc/kcpassword` by XOR with this key.
const KCPASSWORD_KEY = [0x7d, 0x89, 0x52, 0x23, 0xd2, 0xbc, 0xdd, 0xea, 0xa3, 0xb9, 0x1f]
// List every first-login Setup Assistant pane, including ones admin's record doesn't name yet.
const SETUP_ASSISTANT_PANES = [
  "Accessibility",
  "ActivationLock",
  "AppStore",
  "AppearanceSetup",
  "ApplePaySetup",
  "CloudSetup",
  "Intelligence",
  "LockdownMode",
  "Privacy",
  "ScreenTime",
  "SiriSetup",
  "SoftwareUpdate",
  "SyncSetup",
  "SyncSetup2",
  "TermsOfAddress",
  "TouchIDSetup",
  "TrueTone",
  "iCloudLoginForStorageServices",
]
const ADAM_SETUP_ASSISTANT_PLIST = "/Users/adam/Library/Preferences/com.apple.SetupAssistant.plist"
// Put the one-liner in a file because the vanilla image has no clipboard sharing with this Mac.
const ONE_LINER_FILE = "/Users/adam/Desktop/bootstrap.txt"
const ONE_LINER_PATTERN = /## Bootstrapping a machine from nothing\n[\s\S]*?```sh\n(?<line>.+)\n```/v
// Skip the App Store apps because installing them needs an Apple ID signed in to the VM.
// Use Homebrew's own skip list, which `brew` reads from this file, so the host script stays the same as on a real Mac.
const BREW_ENV_FILE = "/etc/homebrew/brew.env"
const MAS_SKIP_LINE = `HOMEBREW_BUNDLE_MAS_SKIP=${Object.values(BREW_PACKAGES.mas).join(" ")}\n`
const DELETE_COMMAND = `tart stop ${VM_NAME}; tart delete ${VM_NAME}`

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

interface Vm {
  ip: string
  /** The ssh options that log in as admin with the ephemeral key */
  ssh: string[]
}

/** Polls `check` until it returns true, or fails after `SSH_TIMEOUT_MS` */
const poll = async (what: string, check: () => Promise<boolean>): Promise<Result> => {
  const deadline = Date.now() + SSH_TIMEOUT_MS
  while (Date.now() < deadline) {
    // oxlint-disable-next-line no-await-in-loop -- each check has to finish before the next one starts
    if (await check()) return
    // oxlint-disable-next-line no-await-in-loop -- the wait between checks is the point
    await bun.sleep(POLL_INTERVAL_MS)
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
    console.error(`\nThis Mac is down to ${freeGb} GB free, so the VM is being stopped and deleted.`)
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

/** Reads the bootstrap one-liner from README.md, so the VM gets exactly what the docs say to run */
const readOneLiner = async (): Promise<Result<string>> => {
  const readme = await attempt(async () => bun.file(path.join(REPO, "README.md")).text())
  if (isErr(readme)) return err("failed to read README.md", readme)
  const line = ONE_LINER_PATTERN.exec(readme)?.groups?.["line"]
  if (line === undefined) return err("found no one-liner under '## Bootstrapping a machine from nothing'", undefined)
  return line
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

/** Runs `command` in the VM as admin, and returns its stdout */
const vmSh = async (vm: Vm, command: string, stdin: string | Buffer = ""): Promise<Result<string>> => {
  const output = await attempt(async () =>
    $`ssh ${vm.ssh} admin@${vm.ip} ${command} < ${Buffer.from(stdin)}`.quiet().text(),
  )
  if (isErr(output)) return err(`failed to run '${command}' in the VM`, output)
  return output
}

const canSsh = async (vm: Vm): Promise<boolean> =>
  (await $`ssh ${vm.ssh} admin@${vm.ip} true`.nothrow().quiet()).exitCode === 0

const readIp = async (): Promise<Result<string>> => {
  const ip = await attempt(async () => $`tart ip ${VM_NAME} --wait 180`.quiet().text())
  if (isErr(ip)) return err(`failed to get the IP of '${VM_NAME}'`, ip)
  return ip.trim()
}

/** Clones the image, grows its disk, and boots it with a window */
const createVm = async (): Promise<Result<Subprocess>> => {
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

  // Detach `tart run` so Ctrl-C reaches only this script, which then stops and deletes the VM itself.
  return bun.spawn(["tart", "run", VM_NAME], { stdio: ["ignore", "ignore", "ignore"], detached: true })
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
const setUpAdam = async (vm: Vm): Promise<Result> => {
  console.info("Growing the VM's disk and creating adam...")
  const password = await attempt(async () => secret("homelab_password"))
  if (isErr(password)) return err("failed to decrypt 'homelab_password'", password)
  const oneLiner = await readOneLiner()
  if (isErr(oneLiner)) return oneLiner

  const commands: [string, string | Buffer][] = [
    ["sudo -n diskutil apfs resizeContainer disk0s2 0", ""],
    ['sudo -n sysadminctl -addUser adam -fullName "Adam Langbert" -password - -admin', `${password}\n`],
    // Mark every pane as seen so adam's first login skips Setup Assistant (Siri, privacy, updates).
    // Start from admin's record because it holds the OS version keys that decide whether the panes come back.
    [
      [
        `sudo -n cp /Users/admin/Library/Preferences/com.apple.SetupAssistant.plist ${ADAM_SETUP_ASSISTANT_PLIST}`,
        ...SETUP_ASSISTANT_PANES.map(
          (pane) => `sudo -n defaults write ${ADAM_SETUP_ASSISTANT_PLIST} DidSee${pane} -bool true`,
        ),
        `sudo -n chown adam:staff ${ADAM_SETUP_ASSISTANT_PLIST}`,
        `sudo -n chmod 600 ${ADAM_SETUP_ASSISTANT_PLIST}`,
      ].join(" && "),
      "",
    ],
    [`sudo -n tee ${ONE_LINER_FILE} >/dev/null && sudo -n chown adam:staff ${ONE_LINER_FILE}`, `${oneLiner}\n`],
    [`sudo -n mkdir -p ${path.dirname(BREW_ENV_FILE)} && sudo -n tee ${BREW_ENV_FILE} >/dev/null`, MAS_SKIP_LINE],
    // Write auto-login by hand because `sysadminctl -autologin` fails to write `/etc/kcpassword` on macOS 26.
    ["sudo -n defaults write /Library/Preferences/com.apple.loginwindow autoLoginUser adam", ""],
    [
      "sudo -n tee /etc/kcpassword >/dev/null && sudo -n chown root:wheel /etc/kcpassword && sudo -n chmod 600 /etc/kcpassword",
      kcpassword(password),
    ],
  ]
  for (const [command, stdin] of commands) {
    // oxlint-disable-next-line no-await-in-loop -- each setup command depends on the one before it
    const result = await vmSh(vm, command, stdin)
    if (isErr(result)) return result
  }

  console.info("Rebooting into adam's session...")
  // Background `shutdown` so the SSH session can close before sshd goes away.
  await $`ssh ${vm.ssh} admin@${vm.ip} ${"(sudo -n shutdown -r now >/dev/null 2>&1 &)"}`.nothrow().quiet()

  // Wait for SSH to drop first, because the old sshd answers for a moment after `shutdown`.
  const down = await poll("the VM to go down for the reboot", async () => !(await canSsh(vm)))
  if (isErr(down)) return down

  const ip = await readIp()
  if (isErr(ip)) return ip
  const rebooted = { ...vm, ip }

  const up = await poll("SSH as admin after the reboot", async () => canSsh(rebooted))
  if (isErr(up)) return up

  const loggedIn = await poll("adam to own the GUI session", async () => {
    const owner = await vmSh(rebooted, "stat -f %Su /dev/console")
    return !isErr(owner) && owner.trim() === "adam"
  })
  if (isErr(loggedIn)) return err("auto-login didn't put adam on the console", loggedIn)

  // Check that adam has to type a password for sudo, like on a real Mac, or bootstrap could pass falsely.
  const sudoRules = await vmSh(rebooted, "sudo -n sudo -l -U adam")
  if (isErr(sudoRules)) return sudoRules
  if (sudoRules.includes("NOPASSWD"))
    return err("adam has passwordless sudo in the VM, which a real Mac doesn't", undefined)
}

const deleteVm = async (): Promise<Result> => {
  const listing = await attempt(async () => TartVms.assert(await $`tart list --format json`.quiet().json()))
  if (!isErr(listing) && !listing.some((vm) => vm.Source === "local" && vm.Name === VM_NAME)) return
  await $`tart stop ${VM_NAME}`.nothrow().quiet()
  const deleted = await attempt(async () => $`tart delete ${VM_NAME}`.quiet())
  if (isErr(deleted)) return err(`failed to delete '${VM_NAME}', so delete it with: ${DELETE_COMMAND}`, deleted)
}

/** Sets up the VM, hands it over, and returns whether setup succeeded once its window closes */
const setUpAndWait = async (dir: string): Promise<boolean> => {
  const key = path.join(dir, "id_ed25519")
  const askpass = path.join(dir, "askpass")
  const publicKey = await attempt(async () => {
    await $`ssh-keygen -q -t ed25519 -N ${""} -f ${key} -C vm-test`
    await bun.write(askpass, `#!/bin/sh\necho ${VANILLA_PASSWORD}\n`)
    await chmod(askpass, 0o700)
    return bun.file(`${key}.pub`).text()
  })
  if (isErr(publicKey)) {
    console.error(messageChain(err("failed to create the ephemeral SSH key", publicKey)))
    return false
  }

  const tartRun = await createVm()
  if (isErr(tartRun)) {
    console.error(messageChain(tartRun))
    return false
  }

  const stopWatching = watchHostDisk()
  const setUp = async (): Promise<Result> => {
    const ip = await readIp()
    if (isErr(ip)) return ip
    const authorized = await authorizeAdminKey(ip, askpass, publicKey)
    if (isErr(authorized)) return authorized
    return setUpAdam({ ip, ssh: ["-i", key, "-o", "BatchMode=yes", ...SSH_COMMON] })
  }
  const setUpResult = await setUp()
  if (isErr(setUpResult)) {
    console.error(messageChain(setUpResult))
    console.error("\nSetup failed. The VM window stays open so you can look around. Close it to delete the VM.")
  } else console.info("The VM is ready and logged in as adam.")

  await tartRun.exited
  stopWatching()
  return !isErr(setUpResult)
}

const main = async (): Promise<number> => {
  const preconditions = await checkPreconditions()
  if (isErr(preconditions)) {
    console.error(messageChain(preconditions))
    return 1
  }

  const dir = await mkdtemp(path.join(os.tmpdir(), "vm-test-"))
  process.on("SIGINT", () => {
    rmSync(dir, { recursive: true, force: true })
    console.error("\nInterrupted, so stopping and deleting the VM...")
    bun.spawnSync(["tart", "stop", VM_NAME])
    bun.spawnSync(["tart", "delete", VM_NAME])
    process.exit(130)
  })

  try {
    const isSetUp = await setUpAndWait(dir)
    console.info(`\nDeleting '${VM_NAME}'...`)
    const deleted = await deleteVm()
    if (isErr(deleted)) {
      console.error(messageChain(deleted))
      return 1
    }
    console.info(`Deleted '${VM_NAME}'.`)
    return isSetUp ? 0 : 1
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

process.exitCode = await main()
