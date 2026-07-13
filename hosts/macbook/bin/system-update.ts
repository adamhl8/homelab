#!/usr/bin/env bun

import { $ } from "bun"

const uninstallOldNodeVersions = async () => {
  const versions = (await $`fnm list`.text()).split("\n")
  for (const line of versions) {
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

await $`bunx taze latest --force --write && rm -rf node_modules/ bun.lock && bun install --force`.cwd(
  "/Users/adam/.bun/install/global",
)

await $`fish --login --interactive --command 'fisher update'`

await $`fish --login --interactive --command 'sdk selfupdate'`
await $`fish --login --interactive --command 'sdk update'`
