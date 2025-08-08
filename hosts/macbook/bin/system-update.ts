#!/usr/bin/env bun

import { $ } from "bun"

async function uninstallOldNodeVersions() {
  const versions = (await $`fnm list`.text()).split("\n")
  for (const line of versions) {
    const [, version, ...aliases] = line.split(" ")
    if (!version) continue
    if (!version.startsWith("v")) continue
    if (aliases.some((alias) => alias.startsWith("latest"))) continue
    // biome-ignore lint/nursery/noAwaitInLoop: uninstall one at a time
    await $`fnm uninstall ${version}`
  }
}

await $`brew update -f`
await $`brew upgrade -g --no-quarantine`
await $`brew autoremove`
await $`brew cleanup --prune=all -s`

await $`fnm install --latest`
await $`fnm default latest`
await uninstallOldNodeVersions()

await $`bunx taze latest -fw && rm -rf node_modules/ bun.lock && bun i -f`.cwd("/Users/adam/.bun/install/global")

await $`fish -li -c 'fisher update'`

await $`fish -li -c 'sdk selfupdate'`
await $`fish -li -c 'sdk update'`
