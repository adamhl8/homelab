import { $ } from "bun"
import { getAddedRemovedDiff } from "bun-infra/lib"
import { createPlugin } from "bun-infra/plugin"

interface BrewFormulaDiff {
  added: string[]
  removed: string[]
}

const brewFormula = createPlugin<string[], BrewFormulaDiff>(
  { name: "Brew Formula" },
  {
    diff: async (_, _previous, formula) => {
      const current = (await $`brew ls --installed-on-request --formula -1`.quiet()).text().trim().split("\n")
      return getAddedRemovedDiff(formula, current)
    },
    handle: async (_, diff) => {
      if (diff.removed.length > 0) {
        for (const formula of diff.removed) await $`brew uninstall --formula ${formula}`
      }
      if (diff.added.length > 0) {
        for (const formula of diff.added) await $`brew install --formula ${formula}`
      }
    },
    update: async () => {
      await $`brew update`
    },
  },
)

export { brewFormula }
