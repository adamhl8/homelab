import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

interface BrewFormulaDiff {
  added: string[]
  removed: string[]
}

const brewCasks: StatefulPluginFactory<string[], BrewFormulaDiff> = (desired) => ({
  name: "Brew Casks",
  current: async () => {
    return (await $`brew ls --cask -1`.quiet()).text().trim().split("\n")
  },
  change: (_, current) => {
    const currentSet = new Set(current)
    const desiredSet = new Set(desired)

    const added = desired.filter((x) => !currentSet.has(x))
    const removed = current.filter((x) => !desiredSet.has(x))

    if (added.length === 0 && removed.length === 0) return
    return { added, removed }
  },
  handle: async (_, change) => {
    if (change.added.length > 0) {
      await $`brew install --cask ${change.added.join(" ")}`
    }
    if (change.removed.length > 0) {
      await $`brew uninstall --cask ${change.removed.join(" ")}`
    }
  },
  update: async () => {
    await $`brew update`
  },
})

export { brewCasks }
