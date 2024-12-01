import { $ } from "bun"
import { createPlugin } from "bun-infra/plugin"

const fnm = createPlugin<null, true>(
  { name: "fnm" },
  {
    diff: (_, previous) => (previous === null ? undefined : true),
    handle: async () => {
      await $`fnm install --latest`
      await $`npm install -g npm`
    },
    update: () => {
      return
    },
  },
)

export { fnm }
