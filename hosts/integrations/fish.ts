import path from "node:path"

import type { Host } from "tsinfra"

import type { Platform } from "#hosts/lib/facts.ts"
import { hostPlatform } from "#hosts/lib/facts.ts"
import { HOSTS } from "#hosts/lib/paths.ts"

// Read the login shell from the user database, which is Directory Services on macOS and `passwd` on Linux.
const LOGIN_SHELL_COMMANDS: Record<Platform, string> = {
  macos: "dscl . -read /Users/$USER UserShell | cut -d' ' -f2",
  linux: "getent passwd $USER | cut -d: -f7",
}

const FISHER_URL = "https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish"

/**
 * Makes fish the login shell, and installs the fisher plugins in `hosts/files/fish_plugins`. Link
 * `~/.config/fish/fish_plugins` before this runs, because `fisher update` reads it.
 */
export const fish = async (h: Host) => {
  const platform = await hostPlatform(h)
  const pluginsText = await Bun.file(path.join(HOSTS, "files/fish_plugins")).text()
  const plugins = new Set(pluginsText.split("\n").filter(Boolean))
  const fishPath = await h.read("command -v fish")
  const shellenv = await h.read("brew shellenv fish")

  // Add the newline back because `read` trims it.
  await h.file("~/.config/fish/conf.d/homebrew.fish", `${shellenv}\n`)

  // Allow fish in `/etc/shells` because `chsh` only accepts a shell listed there.
  await h.ensure("Allow fish as a login shell", {
    want: true,
    check: `grep -qx ${fishPath} /etc/shells`,
    fix: `echo ${fishPath} | sudo tee -a /etc/shells`,
  })

  await h.ensure("Fish is the login shell", {
    want: fishPath,
    check: LOGIN_SHELL_COMMANDS[platform],
    fix: `sudo chsh -s ${fishPath} $USER`,
  })

  // Use `fisher update` because it installs missing plugins and removes unlisted ones.
  await h.ensure("Sync fisher plugins", {
    want: plugins,
    check: "fish -c 'fisher list'",
    fix: `fish -c "curl -sL ${FISHER_URL} | source && fisher update"`,
  })
}
