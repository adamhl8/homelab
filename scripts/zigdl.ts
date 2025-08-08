#!/usr/bin/env bun

import * as process from "node:process"
import { $ } from "bun"

// https://ziglang.org/download/community-mirrors

const ZIG_PUBLIC_KEY = "RWSGOq2NVecA2UPNdBUZykf1CCb147pkmdtYxgb3Ti+JO/wCYvhbAb/U"
const ZIG_COMMUNITY_MIRRORS = "https://ziglang.org/download/community-mirrors.txt"

const ZLS_PUBLIC_KEY = "RWR+9B91GBZ0zOjh6Lr17+zKf5BoSuFvrx2xSeDE57uIYvnKBGmMjOex"

const tarball = process.argv.at(2)
if (!tarball) {
  console.error("Usage: zigdl <tarball>")
  process.exit(1)
}

// tarball looks like: "zig-aarch64-macos-0.15.0-dev.936+fc2c1883b.tar.xz"
const [, ARCH, OS] = tarball.split("-")
const ARCH_OS = `${ARCH}-${OS}`

console.info("Fetching Zig community mirrors...")
const response = await fetch(ZIG_COMMUNITY_MIRRORS)
const communityMirrorsText = (await response.text()).trim()
const communityMirrors = communityMirrorsText.split("\n")
// https://stackoverflow.com/a/46545530
const shuffledMirrors = communityMirrors
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value)

let foundValidMirror = false
for (const mirror of shuffledMirrors) {
  const fullUrl = `${mirror}/${tarball}`

  console.info(`Downloading Zig from mirror '${mirror}'...`)
  // biome-ignore lint/nursery/noAwaitInLoop: try one mirror at a time
  await $`curl -fsSL ${fullUrl} -o ~/${tarball}`
  await $`curl -fsSL ${fullUrl}.minisig -o ~/${tarball}.minisig`

  const verifyResult = await $`minisign -Vm ~/${tarball} -P ${ZIG_PUBLIC_KEY}`.quiet().nothrow()
  if (verifyResult.exitCode !== 0) {
    console.error(`Failed to verify Zig tarball '${tarball}'`)
    continue
  }
  foundValidMirror = true

  await $`rm -rf ~/.zig/`
  await $`mkdir -p ~/.zig/`
  await $`tar -xf ~/${tarball} -C ~/.zig/ --strip-components=1`
  await $`rm -f ~/${tarball} ~/${tarball}.minisig`
  break
}

if (!foundValidMirror) {
  console.error("All mirrors failed verification")
  process.exit(1)
}

const zigVersion = (await $`~/.zig/zig version`.text()).trim()
console.info(`Installed Zig '${zigVersion}'`)

console.info("Finding appropriate ZLS version...")
const zlsResponse = await fetch(
  `https://releases.zigtools.org/v1/zls/select-version?zig_version=${encodeURIComponent(zigVersion)}&compatibility=only-runtime`,
)
const zlsDownloads = (await zlsResponse.json()) as {
  [arch: string]: { tarball: string }
} & { version: string }

const zlsVersion = zlsDownloads["version"]
const zlsTarballUrl = zlsDownloads[ARCH_OS]?.tarball
if (!zlsTarballUrl) {
  console.error(`Failed to find ZLS tarball URL for '${ARCH_OS}'`)
  console.info(JSON.stringify(zlsDownloads, undefined, 2))
  process.exit(1)
}
const zlsTarball = zlsTarballUrl.split("/").pop()
if (!zlsTarball) {
  console.error(`Failed to extract ZLS tarball name from URL '${zlsTarballUrl}'`)
  process.exit(1)
}

console.info("Downloading ZLS...")
await $`curl -fsSL ${zlsTarballUrl} -o ~/${zlsTarball}`
await $`curl -fsSL ${zlsTarballUrl}.minisig -o ~/${zlsTarball}.minisig`
const verifyResult = await $`minisign -Vm ~/${zlsTarball} -P ${ZLS_PUBLIC_KEY}`.quiet().nothrow()
if (verifyResult.exitCode !== 0) {
  console.error(`Failed to verify ZLS tarball '${zlsTarball}'`)
  process.exit(1)
}

await $`tar -xf ~/${zlsTarball} -C ~/.zig/ zls`
await $`rm -f ~/${zlsTarball} ~/${zlsTarball}.minisig`

console.info(`Installed ZLS '${zlsVersion}'`)
