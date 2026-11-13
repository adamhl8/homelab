#!/usr/bin/env bun
import { Buffer } from "node:buffer"
import { chmod, mkdir, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"

import bun, { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

const UPSTREAM_URL = "https://github.com/simbasjungles/free-my-tv.git"
const UPSTREAM_REV = "f1830445e6e629a2f1eab19602afef38a1a4f8b8"
const TV = "Living-Room-TV.lan:5555"
const PACKAGE = "io.freemytv"

const TV_DIR = import.meta.dir
const REPO_DIR = path.resolve(TV_DIR, "..")
const CREDENTIALS_PATH = path.join(REPO_DIR, "secrets/credentials.yaml")
// Keep the checkout outside the repo because it holds the decrypted TMDB key and keystore.
const CHECKOUT_DIR = path.join(os.homedir(), ".cache", "free-my-tv")
const BUILD_SCRIPT_PATH = path.join(CHECKOUT_DIR, "build.sh")
const APK_PATH = path.join(CHECKOUT_DIR, "FreeMyTV.apk")
const PATCHES_DIR = path.join(TV_DIR, "patches")

// Point at `openjdk@17` directly because it is keg-only and never on PATH.
const JAVA_HOME = "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
const ANDROID_HOME = "/opt/homebrew/share/android-commandlinetools"
const ENV = { ...process.env, JAVA_HOME, ANDROID_HOME, PATH: `${JAVA_HOME}/bin:${process.env["PATH"] ?? ""}` }

/** The macbook Brewfile installs these, keyed by formula or cask name */
const BREW_DEPENDENCIES = {
  "openjdk@17": path.join(JAVA_HOME, "bin/javac"),
  "android-commandlinetools": path.join(ANDROID_HOME, "cmdline-tools/latest/bin/sdkmanager"),
  "android-platform-tools": "/opt/homebrew/bin/adb",
} as const

/** The versions upstream's CI builds with, keyed by sdkmanager package */
const SDK_PACKAGES = {
  "build-tools;34.0.0": "build-tools/34.0.0/apksigner",
  "platforms;android-34": "platforms/android-34/android.jar",
} as const

const sops = async (extractPath: string): Promise<Result<string>> => {
  const secret = await attempt(async () => $`sops -d --extract ${extractPath} ${CREDENTIALS_PATH}`.quiet().text())
  if (isErr(secret)) return err(`failed to decrypt '${extractPath}' from '${CREDENTIALS_PATH}'`, secret)
  return secret.trim()
}

const checkBrewDependencies = async (): Promise<Result> => {
  const missing: string[] = []
  for (const [name, binPath] of Object.entries(BREW_DEPENDENCIES))
    if (!(await bun.file(binPath).exists())) missing.push(name)

  if (missing.length > 0) return err(`missing ${missing.join(", ")}: run \`just apply macbook\``, undefined)
}

const installSdkPackages = async (): Promise<Result> => {
  const missing: string[] = []
  for (const [name, filePath] of Object.entries(SDK_PACKAGES))
    if (!(await bun.file(path.join(ANDROID_HOME, filePath)).exists())) missing.push(name)
  if (missing.length === 0) return

  // Accept the SDK licenses up front because sdkmanager otherwise stops to ask about each one.
  const accepted = await attempt(async () =>
    $`sdkmanager --licenses < ${Buffer.from("y\n".repeat(20))}`.env(ENV).quiet(),
  )
  if (isErr(accepted)) return err("failed to accept the Android SDK licenses", accepted)

  const installed = await attempt(async () => $`sdkmanager ${missing}`.env(ENV).quiet())
  if (isErr(installed)) return err(`failed to install ${missing.join(", ")}`, installed)
}

const checkoutUpstream = async (): Promise<Result> => {
  if (!(await bun.file(path.join(CHECKOUT_DIR, ".git/HEAD")).exists())) {
    const created = await attempt(async () => {
      await $`git init -q ${CHECKOUT_DIR}`
      await $`git -C ${CHECKOUT_DIR} remote add origin ${UPSTREAM_URL}`
    })
    if (isErr(created)) return err(`failed to create the checkout at '${CHECKOUT_DIR}'`, created)
  }

  const head = await attempt(async () => $`git -C ${CHECKOUT_DIR} rev-parse HEAD`.nothrow().quiet().text())
  if (!isErr(head) && head.trim() === UPSTREAM_REV) return

  const checkedOut = await attempt(async () => {
    await $`git -C ${CHECKOUT_DIR} fetch -q --depth 1 origin ${UPSTREAM_REV}`
    // Force the checkout because the previous rev's patches leave tracked files modified.
    await $`git -C ${CHECKOUT_DIR} checkout -q -f --detach FETCH_HEAD`
  })
  if (isErr(checkedOut)) return err(`failed to check out ${UPSTREAM_REV}`, checkedOut)
}

/** Resets the checkout's tracked files, then applies every patch in `tv/patches` in name order */
const applyPatches = async (): Promise<Result> => {
  const reset = await attempt(async () => $`git -C ${CHECKOUT_DIR} reset -q --hard`)
  if (isErr(reset)) return err("failed to reset the checkout", reset)

  const patches = await attempt(async () => Array.fromAsync(new bun.Glob("*.patch").scan(PATCHES_DIR)))
  if (isErr(patches)) return err(`failed to list '${PATCHES_DIR}'`, patches)

  for (const patch of patches.toSorted()) {
    // oxlint-disable-next-line no-await-in-loop -- a later patch can build on an earlier one
    const applied = await attempt(async () => $`git -C ${CHECKOUT_DIR} apply ${path.join(PATCHES_DIR, patch)}`.quiet())
    if (isErr(applied)) return err(`failed to apply '${patch}', so refresh it against ${UPSTREAM_REV}`, applied)
  }
}

const writeSecretFile = async (filePath: string, contents: string | Buffer): Promise<Result> => {
  const written = await attempt(async () => {
    await writeFile(filePath, contents, { mode: 0o600 })
    await chmod(filePath, 0o600)
  })
  if (isErr(written)) return err(`failed to write '${filePath}'`, written)
}

/** Writes `config.properties` and `freemytv.keystore` into the checkout */
const writeSettings = async (): Promise<Result> => {
  const config = await attempt(async () => bun.file(path.join(TV_DIR, "config.properties")).text())
  if (isErr(config)) return err("failed to read tv/config.properties", config)

  const tmdbKey = await sops('["tmdb_api_key"]')
  if (isErr(tmdbKey)) return tmdbKey

  // `build.sh` takes the last line for a key, so the appended `tmdb_key` wins.
  const configWritten = await writeSecretFile(
    path.join(CHECKOUT_DIR, "config.properties"),
    `${config.trimEnd()}\ntmdb_key=${tmdbKey}\n`,
  )
  if (isErr(configWritten)) return configWritten

  // Every update must be signed with this same key, or Android refuses to install it.
  const keystore = await sops('["free_my_tv_keystore"]')
  if (isErr(keystore)) return keystore

  return writeSecretFile(path.join(CHECKOUT_DIR, "freemytv.keystore"), Buffer.from(keystore, "base64"))
}

const build = async (): Promise<Result> => {
  const dependencies = await checkBrewDependencies()
  if (isErr(dependencies)) return dependencies

  const sdk = await installSdkPackages()
  if (isErr(sdk)) return sdk

  const cacheDir = await attempt(async () => mkdir(path.dirname(CHECKOUT_DIR), { recursive: true }))
  if (isErr(cacheDir)) return err(`failed to create '${path.dirname(CHECKOUT_DIR)}'`, cacheDir)

  const checkout = await checkoutUpstream()
  if (isErr(checkout)) return checkout

  const patched = await applyPatches()
  if (isErr(patched)) return patched

  const settings = await writeSettings()
  if (isErr(settings)) return settings

  const built = await attempt(async () => $`${BUILD_SCRIPT_PATH}`.cwd(CHECKOUT_DIR).env(ENV))
  if (isErr(built)) return err("build.sh failed", built)
}

/** Lists the serials `adb devices` reports in state `device` */
const authorizedDevices = async (): Promise<Result<string[]>> => {
  const output = await attempt(async () => $`adb devices`.quiet().text())
  if (isErr(output)) return err("failed to list adb devices", output)

  return output
    .split("\n")
    .map((line) => line.split("\t"))
    .filter(([, state]) => state === "device")
    .map(([serial]) => serial ?? "")
}

const install = async (): Promise<Result> => {
  // `adb connect` exits 0 even when it fails, so `authorizedDevices` is the real check.
  await $`adb connect ${TV}`.nothrow()

  const devices = await authorizedDevices()
  if (isErr(devices)) return devices
  if (!devices.includes(TV)) {
    return err(
      `${TV} is not connected: wake the TV (it drops off the network when asleep) and accept any "Allow USB debugging?" prompt`,
      undefined,
    )
  }

  console.info("If this hangs, Play Protect is asking on the TV: More details -> Install anyway")
  const installed = await attempt(async () => $`adb -s ${TV} install -r ${APK_PATH}`)
  if (isErr(installed)) return err(`failed to install on ${TV}`, installed)

  // TCL's `TclAppBoot` blocks background jobs by default, and the home screen switch runs as one.
  const autoStart = await attempt(async () => $`adb -s ${TV} shell appops set ${PACKAGE} AUTO_START allow`)
  if (isErr(autoStart)) return err("failed to allow auto start", autoStart)

  // Disconnect so the TV hands its own debugging prompt to the app rather than to this Mac.
  await $`adb disconnect ${TV}`.nothrow()
}

const main = async (): Promise<number> => {
  const shouldInstall = process.argv.includes("--install")

  const built = await build()
  if (isErr(built)) {
    console.error(built.messageChain)
    return 1
  }

  if (shouldInstall) {
    const installed = await install()
    if (isErr(installed)) {
      console.error(installed.messageChain)
      return 1
    }
  }

  return 0
}

process.exitCode = await main()
