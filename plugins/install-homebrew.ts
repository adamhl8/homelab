import { $ } from "bun"
import type { StatelessPluginFactory } from "bun-infra/types/plugin"

const installHomebrew: StatelessPluginFactory = () => ({
  name: "Install Homebrew",
  handle: async () => {
    await $`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  },
  update: () => {
    return
  },
})

export { installHomebrew }
