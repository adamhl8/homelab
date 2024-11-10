import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

interface BrewFormulaDiff {
  added: string[]
  removed: string[]
}

const brewFormula: StatefulPluginFactory<string[], BrewFormulaDiff> = (casks) => ({
  name: "Brew Formula",
  desired: casks,
  current: async () => {
    return (await $`brew ls --installed-on-request --formula`.quiet()).text().trim().split("\n").filter(Boolean)
  },
  change: (_, _previous, current) => {
    const currentSet = new Set(current)
    const desiredSet = new Set(casks)

    const added = casks.filter((x) => !currentSet.has(x))
    const removed = current.filter((x) => !desiredSet.has(x))

    if (added.length === 0 && removed.length === 0) return
    return { added, removed }
  },
  handle: async (_, change) => {
    if (change.added.length > 0) {
      for (const formula of change.added) await $`brew install ${formula}`
    }
    if (change.removed.length > 0) {
      for (const formula of change.removed) await $`brew uninstall ${formula}`
    }
  },
  update: async () => {
    await $`brew update`
  },
})

export { brewFormula }
