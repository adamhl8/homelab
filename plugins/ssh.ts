import { $ } from "bun"
import { getSopsSecret } from "bun-infra/lib"
import { createPlugin } from "bun-infra/plugin"

const ssh = createPlugin<null, true>(
  { name: "SSH" },
  {
    diff: (_, previous) => (previous === null ? undefined : true),
    handle: async (ctx) => {
      await $`mkdir -p ~/.ssh/`
      await $`chmod 700 ~/.ssh/`
      const privateKey = await getSopsSecret(`${ctx.host}.pri`)
      const publicKey = await getSopsSecret(`${ctx.host}.pub`)
      await $`echo "${privateKey}" >~/.ssh/id_ed25519`
      await $`echo "${publicKey}" >~/.ssh/id_ed25519.pub`
      await $`chmod 600 ~/.ssh/id_ed25519`
      await $`chmod 644 ~/.ssh/id_ed25519.pub`
    },
  },
)

export { ssh }
