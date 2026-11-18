#!/usr/bin/env bun

import os from "node:os"
import path from "node:path"

import { $ } from "bun"

const BUN_GLOBAL_DIR = path.join(os.homedir(), ".bun/install/global")

const uninstallOldNodeVersions = async () => {
  const fnmList = await $`fnm list`.text()
  for (const line of fnmList.split("\n")) {
    const [, version, ...aliases] = line.split(" ")
    if (!version) continue
    if (!version.startsWith("v")) continue
    if (aliases.some((alias) => alias.startsWith("latest"))) continue

    // oxlint-disable-next-line no-await-in-loop -- uninstall one at a time
    await $`fnm uninstall ${version}`
  }
}

await $`brew update --force`
await $`brew upgrade --greedy`
await $`brew autoremove`
await $`brew cleanup --prune=all --scrub`

await $`fnm install --latest`
await $`fnm default latest`
await uninstallOldNodeVersions()

await $`bunx taze latest --force --write && rm -rf node_modules/ bun.lock && bun install --force`.cwd(BUN_GLOBAL_DIR)

await $`fish --login --interactive --command 'fisher update'`
