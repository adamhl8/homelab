import { $ } from "bun"
import type { StatelessPluginFactory } from "bun-infra/types/plugin"
import { runFishCmd } from "./utils/utils.ts"

async function install() {
  await $`brew install fish`
  await $`mkdir -p ~/.config/fish/conf.d/`
  await $`$HOMEBREW_PREFIX/bin/brew shellenv fish >~/.config/fish/conf.d/homebrew.fish`
}

async function setDefaultShell() {
  const fishPath = { raw: "$HOMEBREW_PREFIX/bin/fish" }
  try {
    await $`grep -q fish /etc/shells`
    console.info("fish is already in /etc/shells")
  } catch {
    await $`echo ${fishPath} | sudo tee -a /etc/shells >/dev/null`
    console.info(`Added ${fishPath.raw} to /etc/shells`)
  }

  await $`chsh -s ${fishPath}`
}

async function configure() {
  await runFishCmd(
    "curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher",
  )
  await runFishCmd("fisher install IlanCosman/tide")
  await runFishCmd("echo 2 1 2 3 1 1 1 1 1 1 1 y | tide configure >/dev/null")

  await runFishCmd("fisher install daleeidd/natural-selection")
  await runFishCmd("fisher install PatrickF1/fzf.fish")
}

const installFish: StatelessPluginFactory = () => ({
  name: "Install Fish",
  handle: async () => {
    await install()
    await setDefaultShell()
    await configure()
  },
  update: () => {
    return
  },
})

export { installFish }
