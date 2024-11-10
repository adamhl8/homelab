import { $ } from "bun"
import type { StatelessPluginFactory } from "bun-infra/types/plugin"
import { installAppFromZip } from "../utils/utils.ts"

const kekaHelper: StatelessPluginFactory = () => ({
  name: "Keka Helper",
  handle: async () => {
    await installAppFromZip("https://d.keka.io/helper")
    await $`/Applications/KekaExternalHelper.app/Contents/MacOS/KekaExternalHelper --set-as-default`.quiet()
    await $`rm -rf /Applications/KekaExternalHelper.app`.quiet()
  },
  update: () => {
    return
  },
})

export { kekaHelper }
