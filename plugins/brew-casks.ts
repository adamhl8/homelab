import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

interface BrewCaskChange {
  added: string[]
  removed: string[]
}

const brewCasks: StatefulPluginFactory<string[], BrewCaskChange> = (casks) => ({
  name: "Brew Casks",
  desired: () => casks,
  current: async () => {
    return (await $`brew ls --cask -1`.quiet()).text().trim().split("\n").filter(Boolean)
  },
  change: (_, _previous, current, casks) => {
    const currentSet = new Set(current)
    const desiredSet = new Set(casks)

    const added = casks.filter(Boolean).filter((x) => !currentSet.has(x))
    const removed = current.filter(Boolean).filter((x) => !desiredSet.has(x))

    if (added.length === 0 && removed.length === 0) return
    return { added, removed }
  },
  handle: async (_, change) => {
    if (change.added.length > 0) {
      for (const cask of change.added) await $`brew install --cask ${cask}`
    }
    if (change.removed.length > 0) {
      for (const cask of change.removed) await $`brew uninstall --cask ${cask}`
    }
  },
  update: async () => {
    await $`brew update`
  },
})

export { brewCasks }
