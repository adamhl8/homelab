import { $ } from "bun"
import type { StatelessPluginFactory } from "bun-infra/types/plugin"
import { resolveLocalPath } from "../utils/paths.ts"

const sopsConfig: StatelessPluginFactory = () => ({
  name: "sops Config",
  handle: async () => {
    await $`mkdir -p ~/.config/sops/age/`
    await $`echo "Enter key.age passphrase" && age -o ~/.config/sops/age/keys.txt -d ${resolveLocalPath("configs/key.age")}`
    await $`chmod 600 ~/.config/sops/age/keys.txt`
  },
})

export { sopsConfig }
