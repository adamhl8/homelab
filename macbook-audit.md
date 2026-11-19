# MacBook audit (layer -1)

What's on this Mac that `hosts/macbook.ts` doesn't capture, as of 2026-11-19. The goal: wipe the
Mac, run bootstrap and `tsinfra apply macbook`, and get it back the way you want it.

How it was built: a read-only collector ran on this Mac and in a clean macOS 26 Tart VM. The VM
diff removed factory defaults. Then everything `macbook.ts`, `brew.ts`, `dotfiles.ts`, and
`macos-defaults.ts` already manage was struck out. What's left was filtered by one question: would
you notice it missing after a rebuild? The VM is a macOS version behind this Mac, so a few Apple
keys below are marked "confirm" because they may just be macOS 27 writing a default.

Items are grouped by the kind of work. "Confirm" means I think it's yours, but check it first.

## Before you wipe anything (data, not config)

The VM test proves config comes back. It says nothing about data, and this Mac has no Time Machine
destination, and Desktop/Documents are not in iCloud.

- [ ] `~/dev/rarebound` has 20 uncommitted files and its branch has no upstream.
- [ ] `~/dev/tsinfra` has 1 unpushed commit. `~/dev/bask` has 1 uncommitted file.
- [ ] Data outside git and iCloud: `~/Documents`, `~/Desktop`, `~/Downloads`, `~/Calibre Library`,
      `~/tools` (SimpDL, the `ofscraper` binary, URL lists), `~/.hermes`. Back these up somewhere,
      or decide they're disposable.

## 1. New integrations (or extensions of existing ones)

- [ ] **Extend `macosDefaults` to cover what it can't write today.** It handles scalar values in
      the normal domain only. Several items below need more:
  - `-currentHost` domains (modifier remap, screensaver idle time, tap to click)
  - dict and array values (symbolic hotkeys, Color Picker formats, IINA plugin order)
  - data blobs (AltTab's hold shortcut is an archived `NSData`)
  - keys with spaces need quoting in the `defaults write` command

- [ ] **Login items** (System Settings, General, Login Items, "Open at Login"). Nothing manages
      this list today. Want these 7:

      Raycast, Shottr, OrbStack, Pure Paste, Menu Bar Calendar, Onigiri, Signal Shifter

      System Events can read and write the list:
      `osascript -e 'tell application "System Events" to get the name of every login item'` to
      check, and `make login item at end with properties {path:"/Applications/X.app", hidden:false}`
      to add. On a fresh Mac, the first run asks permission for the terminal to control System
      Events. That's one click, and it belongs in section 5.
      Leave out Drata Agent and Acrobat Collaboration Synchronizer, which their installers add.
      The list also has five apps you no longer have (section 6).

- [ ] **System keyboard shortcuts** (`com.apple.symbolichotkeys`, `AppleSymbolicHotKeys`). These
      are the ones you changed. Copy each entry's exact value from
      `defaults read com.apple.symbolichotkeys`, then run
      `/System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u`
      so they apply without a logout.
  - 64 and 65 disabled: Spotlight (Cmd-Space) and Finder search (Cmd-Opt-Space). Raycast's hotkey
    is Cmd-Space, so this one matters.
  - 28 to 31 disabled: the Cmd-Shift-3/4 screenshot shortcuts, for Shottr.
  - 27 disabled: move focus to next window (Cmd-`). 263 enabled with Cmd-Opt-Shift-`.
  - 61 enabled: select next input source (Ctrl-Opt-Space). Confirm.
  - 164, 176 (Siri), 260 disabled. I couldn't identify 164 and 260 with confidence.

- [ ] **Modifier key remap for the Logitech keyboard.** Cmd and Option are swapped on both sides
      for vendor 1133, product 49948. It lives in `-currentHost` `NSGlobalDomain` as
      `com.apple.keyboard.modifiermapping.1133-49948-0`. It takes effect after the keyboard
      reconnects or you log in again.

- [ ] **Printer.** Canon TS6400 over AirPrint, so it's one `lpadmin` call:
      `lpadmin -p Canon_TS6400_series -E -v 'dnssd://Canon%20TS6400%20series._ipps._tcp.local./?uuid=00000000-0000-1000-8000-0018d310e9c4' -m everywhere`.

- [ ] **IINA plugins.** Four live in `~/Library/Application Support/com.colliderli.iina/plugins`:
      your `iina-video-cleaner` (from `~/dev/video-cleaner`) plus `ytdl`, `opensub`, and
      `user-script`. IINA's bundled `iina-plugin` CLI can install them. The enable flags are
      defaults (section 3).

- [ ] **Claude Code skills from the skills CLI.** `gh-stack` and `openscreen-demo` were installed by
      `npx skills` and are recorded in `~/.agents/.skill-lock.json` with their source repos.
      Either link the lock file and check whether the CLI can restore from it, or add them as
      install steps.

- [ ] **Git repos (your call).** 33 checkouts, all on GitHub. A "clone if missing" step would
      bring back the ones you want. Most live in `~/dev`:

      adamhl.dev, adamhl8, astro-validate-env, bask, configs, dataviewjs-habit-tracker,
      declutter, delete-refs, discord-app-bot, discord-bot-shared, discord-message-mirror-bot,
      filterql, font-iosevka, guild-sim, homebrew-inspectarr, inspectarr,
      jsonresume-theme-react-tailwind, obsidian-toggle-both-sidebars, oxlint-plugin-clean-modules,
      oxlint-plugin-package-boundaries, rarebound, release-it-git-cliff, school, scoop-inspectarr,
      ts-explicit-errors, tsinfra, venmo-actual (actual-budget-venmo-importer), video-cleaner
      (iina-video-cleaner)

      Elsewhere: `~/obsidian` (your vault, so this one probably matters most), `~/parlay/prevet`
      (Parlay-Finance), `~/tools/SimpDL` (third-party). `~/homelab` is cloned by bootstrap, and the
      daisyui checkout belongs to a Claude Code plugin marketplace.

## 2. Files to bring into the repo

- [ ] `~/.claude/commands/cleanup-comments.md`: link, like `organize-stars.md`.
- [ ] `~/.claude/skills/{pr-description,review-pr-findings,typescript}/SKILL.md`: your own skills,
      not in the repo. Link.
- [ ] `~/bin/dev-cleanup.sh`: a 72 KB script of yours, not in the repo. Move it to
      `hosts/files/bin/` so `binScripts` links it.
- [ ] `~/.config/cyberdrop-dl/config.yaml`: link. Its `api_key`, `password`, and `cookies` fields
      are empty today. If you ever fill them, that file needs sops.
- [ ] **Zed extensions.** 33 are installed and nothing declares them. Zed has a built-in for this:
      add `auto_install_extensions` to `hosts/files/zed/settings.json`. The installed set:
      astro, biome, caddyfile, catppuccin, catppuccin-icons, codebook, docker-compose, dockerfile,
      fish, git-firefly, gleam, golangci-lint, gosum, graphql, groovy, html, java, just, lua,
      material-icon-theme, opentofu, oxc, prisma, proto, ruby, sql, swift, toml, tsgo, typst,
      vscode-dark-modern, xml, zig. Prune before adding.
- [ ] `~/.orbstack/vmconfig.json` (`data_allow_backup`, `mount_hide_shared`): copy, not link,
      because OrbStack rewrites it.
- [ ] **Raycast.** Its hotkeys, extensions, quicklinks, and snippets live in an encrypted database,
      not defaults, and Cloud Sync is off (no Pro). Export a `.rayconfig` (Settings, Advanced,
      Export) into the repo, and keep its export password in sops. Importing it is a manual
      double-click.
- [ ] `~/.npmrc`: holds an npm `_authToken`. Already in `todo.md`: template it from sops.
- [ ] Links apps normally create through their settings: `~/bin/iina-plugin` (to IINA's binary)
      and `/usr/local/bin/tailscale` (Tailscale's "Install CLI", needs sudo).

## 3. Settings to add to `macos-defaults.ts`

Values are what this Mac has now. Anything that needs section 1's extension is marked.

**macOS**

- [ ] `com.apple.AppleMultitouchTrackpad` `ActuateDetents: 0`
- [ ] `-currentHost` `NSGlobalDomain` `com.apple.mouse.tapBehavior: 1` (tap to click at the
      login window, the partner of the `Clicking` you already set, needs `-currentHost`)
- [ ] `-currentHost` `com.apple.screensaver` `idleTime: 0` (screensaver never starts, needs
      `-currentHost`)
- [ ] Confirm: `NSGlobalDomain` `NSAutoFillHeuristicControllerEnabled: false`,
      `shouldShowRSVPDataDetectors: false`, `AppleIconAppearanceTheme: "RegularLight"`
- [ ] Confirm: Siri. `com.apple.Siri` has `VoiceTriggerUserEnabled: false` and its keyboard
      shortcut disabled, but `com.apple.assistant.support` `Assistant Enabled` is `true`. Decide
      what you want, then write those.

**Already-managed apps, keys not yet in the file**

- [ ] Shottr: the hotkeys `KeyboardShortcuts_area`, `_anyWindow`, `_scrolling`, `_ocr` (JSON
      strings), `KeyboardShortcuts_fullscreen: false`, `afterGrabCopy: true`,
      `afterGrabSave: true`, `afterGrabShow: false`, `copyOnEsc: true`,
      `thumbnailClosing: "manual"`, `cmdQAction: "close"`, `colorFormat: "HEX"`,
      `expandableCanvas: true`, `customBackdropColor`, `customDrawingColor`, `scrollingSpeed: 2`
- [ ] Ice: `ShowOnScroll: true`, `ShowSectionDividers: false`, `UseIceBar: false`,
      `ShowOnHoverDelay: 0.2`, `TempShowInterval: 15`
- [ ] AltTab: `holdShortcut` and `holdShortcut2` (archived data, needs the extension)

**Other apps**

- [ ] ForkLift: `theme: "DefaultDark"`, `TerminalApplication: 5`, `alwaysShowTabbar: true`,
      `listViewAlternatingBackground: true`, `restoreTabs: false`, `handleArchives: false`,
      `cloudSync: false`, `infoMode: 1`. The sidebar favorites are binary blobs, so set those
      by hand.
- [ ] IINA: `actionAfterLaunch: 1`, `quitWhenNoOpenedWindow: true`, `recordPlaybackHistory: false`,
      `showRemainingTime: true`, `hardwareDecoder: 2`, `enableAdvancedSettings: 1`, the four
      `PluginEnabled.<id>: true` keys, and `PluginOrder` (array, needs the extension)
- [ ] Pure Paste: `hideMenuBarIcon: true`, `trimLeadingAndTrailingWhitespace: true`,
      `automaticallyClearFormatting: false`, `KeyboardShortcuts_clearFormatting` (JSON string)
- [ ] Menu Bar Calendar: `menuBarIcon: "date"`, `calendarDayClickAction: "showInCalendar"`,
      `dimWeekend: false`, `showWeekNumbers: false`
- [ ] Onigiri: `launchAtLogin: true`, `autoMute: true`, `iconStyle: "expanded"`,
      `presetTimerOne: 10`, `presetTimerTwo: 15`, `presetTimerThree: 20`, `alarmVolume: 0.5`
- [ ] AudioWrangler: `showMenuBarIcon: false`, `prependNewDevices: false`, and the
      `inputDevices`/`outputDevices` priority lists (JSON strings tied to your headsets and mic)
- [ ] Color Picker: `shownColorFormats: ["oklch", "rgb", "hsl", "hex"]` (array)
- [ ] Tailscale: `HideDockIcon: true`, `TailscaleStartOnLogin: true`
- [ ] ProtonVPN: `ConnectOnDemand: true`, `Firewall: true` (kill switch), `StartOnBoot: false`,
      `alternativeRouting: true`, `smartProtocol: true`
- [ ] UTM: `NoQuitConfirmation: true`, `ShowMenuIcon: false`
- [ ] Keka: it writes every setting, so diffing can't tell your choices from its defaults.
      Likely yours: `AppearanceShowDockIcon: 0`, `DefaultFormat: "ZIP"`. To find the rest, run
      `bask defaults-diff` while toggling things in Keka's settings.

## 4. Packages

- [ ] Apps installed outside brew. For each, check `brew info --cask <name>` and add the cask, or
      drop the app:
  - Claude (cask `claude`)
  - TinkerTool (`tinkertool`)
  - Adobe Digital Editions (`adobe-digital-editions`). Two copies are installed, 4.5 and
    current.
  - vibe, Openscreen, Archon App, Video DownloadHelper CoApp: unsure there's a cask for these
- [ ] **Claude Code CLI.** Installed with the native installer to `~/.local/bin/claude`, and
      nothing in the repo installs it. Either add the installer as a step (it self-updates) or
      use the `claude-code` cask.
- [ ] **Node.** `fnm` is in brew, but no Node version is installed on a fresh Mac, so `npm` and
      `npx` don't exist. This Mac has v26.10.0 (default) and v22.23.3. Add an ensure step:
      `fnm install 26 && fnm default 26`.
- [ ] **Rust.** `rustup` is in brew but ships no toolchain. Add `rustup default stable`.
- [ ] Hermes agent (`~/.hermes`, with wrappers in `~/.local/bin`). Installed by its own script.
      Keep it with an install step, or drop it.

## 5. Can't be automated (README: "what layer -1 doesn't cover")

- **Sign-ins:** App Store, 1Password, Raycast, Zen (Firefox Sync, if you use it), Discord, Slack,
  Signal, Steam, Battle.net, Tailscale, ProtonVPN, Claude, `gh auth login`, `aws sso login`, and
  `docker login` for ghcr.io, Docker Hub, and registry.vulcan.mil (Docker keeps these in the
  keychain).
- **Licenses:** ForkLift and Shottr store theirs in defaults (`registrationData`, `kc-license`).
  Keep the keys in 1Password and enter them by hand.
- **Privacy permissions:** Accessibility, Screen Recording, and Full Disk Access for AltTab, Ice,
  LinearMouse, Raycast, Shottr, Ghostty, and others. macOS only allows granting these by hand or
  through MDM.
- **Wi-Fi configuration profile** (`wifi.cloudpath.net`): installed through that network's own
  onboarding.
- **Raycast import:** double-click the `.rayconfig` from section 2.
- **Drata agent:** enrollment.
- **"Launch at login" toggles inside 1Password and AudioWrangler.** They register themselves with
  macOS when you flip the switch in the app, and they keep nothing in defaults to write.
  (AltTab and Tailscale also register themselves, but their defaults keys in section 3 cover them.)
- **Automation permission** for the terminal to control System Events, the first time the
  login items step runs.
- **Per-app notification settings:** stored in `com.apple.ncprefs` as opaque flags.

## 6. Junk to clean up (optional, a wipe removes it anyway)

- Leftover prefs and Application Support folders from about 60 apps you no longer have (Amazon
  Prime Video, Moonlight, Moom, Loop, Zoom, Microsoft Remote Desktop, Telegram, VLC, JetBrains,
  Cursor, Arc, Brave, Opera, Vivaldi, Edge, Firefox, Plex, qBittorrent, balenaEtcher, CCleaner,
  and more).
- `/Library/LaunchDaemons/com.launch.vlabelprinter.plist`: from a label printer app (Labelife)
  that's gone. 2023. It's still enabled and runs `launch-vlabelprinter-task.sh` as root.
- Login items for apps you no longer have: Loop, Blip, LocalSend, BentoBox, boringBar.
- `/Applications/Banking.app`: an empty bundle with no `Contents`.
- The duplicate Adobe Digital Editions 4.5.
- `~/bin/incus-update`: a dangling link to `~/homelab/tools/incus-update`, which moved to
  `archive/`.
- Fish: the `sponge_*` universal variables (sponge isn't in `fish_plugins`), five stale
  `fishd.tmp.*` files, and `fish_user_paths` (`config.fish` already adds `~/.local/bin`).
- `~/.config/zed/settings_backup.json`.

## 7. Looked at and skipped

- Brew formulae and casks: already in sync (`bask plan macbook` shows no cleanup candidates).
- Mac App Store apps: all 10 match `brew.ts`.
- bun globals and uv tools: already declared. Gems: stock system Ruby. Cargo: nothing installed.
- Fish abbreviations: already in `config.fish`. Fish completions: generated by bun, uv, fisher,
  and OrbStack.
- Text replacements: only the macOS default (`omw`).
- `/etc`: nothing hand-edited apart from the printer and fish in `/etc/shells` (the fish
  integration does that). No hosts entries, resolvers, `sudoers.d`, or Touch ID `sudo_local`.
- Fonts: Iosevka (fonts integration) and Atkinson Hyperlegible (cask).
- Firewall off, no DNS overrides on any interface.
- Input sources: U.S. plus the built-in palettes. Built-in keyboard modifier mapping: no-op.
- Finder, Dock, Terminal, Safari, Preview, Calendar, Notes: window state and usage counters
  beyond what's managed. Safari has the Develop menu on, but you browse in Zen.
- QDirStat: Qt writes every setting, so there's nothing to tell apart.
- Electron apps (Slack, Discord, Obsidian, Signal, 1Password, LosslessCut): only boilerplate keys.
- Claude Desktop config: preferences only, no MCP servers. `~/.claude.json`: app state.
- `~/.config/gh/hosts.yml`, `~/.docker/config.json`: auth (section 5).
- `~/.kube`, `~/.terraform.d`: empty.
- Menu bar item visibility (Battery, Wi-Fi): laptop defaults. Ice handles the rest.
- OrbStack's `~/bin` and `/usr/local/bin` links: OrbStack recreates them.
- Google updater LaunchAgents: come back with the Chrome cask.
- Background tasks (Claude, Discord, Ghostty, Obsidian, OrbStack, Signal, Slack, Zed, Zen,
  BambuStudio, 1Password), Raycast's updater agent, Ghostty's dock tile, and the QLVideo
  Spotlight importer: each app registers these itself on first launch.
- Remote Login (SSH into this Mac): off, which is the macOS default.
