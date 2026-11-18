import path from "node:path"

import { host, PRIVATE_DIRECTORY_MODE } from "tsinfra"

import { brewPackages } from "#hosts/integrations/brew.ts"
import { bunGlobals } from "#hosts/integrations/bun.ts"
import { binScripts, linkFiles } from "#hosts/integrations/files.ts"
import { fish } from "#hosts/integrations/fish.ts"
import { iosevkaFonts } from "#hosts/integrations/fonts.ts"
import { gitConfig } from "#hosts/integrations/git.ts"
import { hostname } from "#hosts/integrations/hostname.ts"
import { macosDefaults } from "#hosts/integrations/macos/defaults.ts"
import { dock } from "#hosts/integrations/macos/dock.ts"
import { fileHandlers } from "#hosts/integrations/macos/file-handlers.ts"
import { power } from "#hosts/integrations/macos/power.ts"
import { wallpaper } from "#hosts/integrations/macos/wallpaper.ts"
import { sshKeys } from "#hosts/integrations/ssh.ts"
import { HOSTS, REPO } from "#hosts/lib/paths.ts"
import { secret } from "#hosts/lib/sops.ts"
import { BREW_PACKAGES } from "#hosts/macbook/brew.ts"
import { DOTFILES } from "#hosts/macbook/dotfiles.ts"
import { MACOS_DEFAULTS } from "#hosts/macbook/macos-defaults.ts"

export default host(
  { name: "macbook", target: "@local", sudo: { password: await secret("homelab_password") } },
  async (h) => {
    await hostname(h, "adam-macbook", "Adam’s MacBook Pro")

    // Install brew packages first because later steps use tools from them, like `gh`, `dockutil`, and `fish`.
    await brewPackages(h, BREW_PACKAGES, {
      updateBrew: true,
      upgrade: true,
      greedy: true,
      force: true,
      sudoPassword: h.meta.sudoPassword,
    })

    await bunGlobals(h, "@adamhl8/bask", "@adamhl8/declutter", "delete-refs", "pnpm@11", "turbo")

    await iosevkaFonts(h)

    await dock(
      h,
      "/Applications/ForkLift.app",
      "/Applications/Zen.app",
      "/Applications/Obsidian.app",
      "/Applications/Zed.app",
      "/Applications/Ghostty.app",
      "/Applications/Discord.app",
      "/Applications/Slack.app",
    )

    // Keep the Mac awake at full power on AC, and sleep the display fast on battery.
    await power(h, {
      ac: { sleep: 0, displaysleep: 10, powermode: 2 },
      battery: { displaysleep: 2, powermode: 0 },
    })

    await wallpaper(h, path.join(HOSTS, "macbook/files/wallpaper.jpg"))

    await gitConfig(h, REPO, { "remote.origin.url": "git@github.com:adamhl8/homelab.git" })

    const defaultsResult = await macosDefaults(h, MACOS_DEFAULTS)

    const handlersResult = await fileHandlers(h, {
      "public.folder": "com.binarynights.ForkLift",
      "com.adobe.pdf": "com.adobe.Acrobat.Pro",
    })

    // Leave Ice, AltTab, and Shottr running because `killall` doesn't relaunch them, and they read defaults on launch.
    await h.run(
      "Restart Dock, Finder, and Control Center",
      async ({ inspect }) => {
        // Use `inspect` because `killall` exits 1 for an app that isn't running.
        for (const app of ["Dock", "Finder", "ControlCenter"]) await inspect(`killall ${app}`)
      },
      { after: [defaultsResult, handlersResult] },
    )

    await sshKeys(h, { id_ed25519: "adam-macbook" })
    await h.dir("~/.aws", { mode: PRIVATE_DIRECTORY_MODE })

    await linkFiles(h, { ...DOTFILES, ...(await binScripts()) })

    await fish(h)
  },
)
