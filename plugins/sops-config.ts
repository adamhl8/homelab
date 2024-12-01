import { $ } from "bun"
import { resolvePath } from "bun-infra/lib"
import { createPlugin } from "bun-infra/plugin"

const sopsConfig = createPlugin<null, true>(
  { name: "sops Config" },
  {
    diff: (_, previous) => (previous === null ? undefined : true),
    handle: async (ctx) => {
      await $`mkdir -p ~/.config/sops/age/`
      ctx.logger.info("Enter key.age passphrase")
      await $`age -o ~/.config/sops/age/keys.txt -d ${await resolvePath("./configs/key.age")}`
      await $`chmod 600 ~/.config/sops/age/keys.txt`
    },
  },
)

export { sopsConfig }
