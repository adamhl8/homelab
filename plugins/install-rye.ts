import os from "node:os"
import path from "node:path"
import { $ } from "bun"
import type { Optional, StatelessPluginFactory } from "bun-infra/types/plugin"

interface InstallRyeOptions {
  pythonVersion?: string
}

const installRye: StatelessPluginFactory<Optional<InstallRyeOptions>> = (options) => ({
  name: "Install Rye",
  handle: async () => {
    const pythonVersion = options?.pythonVersion ?? "3.12"
    await $`RYE_TOOLCHAIN_VERSION="${pythonVersion}" RYE_INSTALL_OPTION="--yes" /bin/bash -c "$(curl -fsSL https://rye.astral.sh/get)"`
    // https://github.com/oven-sh/bun/issues/9747
    const ryePath = path.join(os.homedir(), ".rye", "shims", "rye")
    await $`${ryePath} config --set-bool behavior.global-python=true`
    await $`${ryePath} config --set default.toolchain=${pythonVersion}`
    await $`${ryePath} toolchain fetch ${pythonVersion}`
    await $`${ryePath} self completion -s fish >~/.config/fish/completions/rye.fish`
  },
  update: () => {
    return
  },
})

export { installRye }
