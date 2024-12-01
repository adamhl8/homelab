import { $ } from "bun"
import { createPlugin } from "bun-infra/plugin"
import type { HostContext } from "bun-infra/types"
import { installAppFromZip } from "../../utils/utils.ts"

async function useKekaHelper(ctx: HostContext) {
  await installAppFromZip("https://d.keka.io/helper")
  ctx.logger.info("Setting Keka as default...")
  await $`/Applications/KekaExternalHelper.app/Contents/MacOS/KekaExternalHelper --set-as-default`.quiet()
  await $`rm -rf /Applications/KekaExternalHelper.app`.quiet()
}

const kekaHelper = createPlugin<null, true>(
  { name: "Keka Helper" },
  {
    diff: (_, previous) => (previous === null ? undefined : true),
    handle: useKekaHelper,
    update: useKekaHelper,
  },
)

export { kekaHelper }
