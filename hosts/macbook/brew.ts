import type { BrewPackages } from "#hosts/integrations/brew.ts"

export const BREW_PACKAGES = {
  taps: ["oven-sh/bun", "mikescher/tap", "adamhl8/inspectarr", "localstack/tap"],
  brews: [
    "git",
    "git-delta",

    "fish",
    "starship",
    "micro",

    "bat",
    "eza",
    "fd",
    "fzf",
    "ripgrep",
    "jq",
    "yq",

    "age",
    "sops",

    "doggo",
    "iperf3",

    "bun",
    "fnm",
    "rustup",
    "uv",

    "awscli",
    "opentofu",
    "caddy",
    "mikescher/tap/dops",

    "gh",
    "git-cliff",
    "lefthook",
    "just",
    "actionlint",
    "shellcheck",
    "shfmt",
    "dockerfmt",

    "bash",
    "coreutils",
    "diffutils",
    "findutils",
    "curl",
    "wget",
    "gawk",
    "gnu-sed",
    "gnu-tar",
    "grep",
    "gzip",
    "zip",
    "unzip",

    "localstack/tap/localstack-cli",

    "ffmpeg",
    "adamhl8/inspectarr/inspectarr",

    "m-cli",
    "mas",
    "dockutil",

    "openjdk@17",
  ],
  casks: [
    "android-commandlinetools",
    "android-platform-tools",

    "font-atkinson-hyperlegible-next",

    "ghostty",
    "zed",
    "orbstack",
    "utm",
    "bruno",

    "zen",
    "google-chrome",

    "obsidian",

    "1password",
    "protonvpn",
    "tailscale-app",

    "discord",
    "signal",
    "slack",

    "iina",
    "jellyfin-media-player",
    "losslesscut",
    "quicklook-video",
    "calibre",

    "forklift",
    "raycast",
    "alt-tab",
    "jordanbaird-ice",
    "linearmouse",
    "shottr",
    "music-decoy",
    "cameracontroller",
    "qdirstat",

    "adobe-acrobat-pro",
    "bambu-studio",
    "steam",
    "battle-net",

    "anydesk",
    "parsec",
    "drata-agent",
  ],
  mas: {
    AudioWrangler: "1565701763",
    "Brother iPrint&Scan": "1193539993",
    "Color Picker": "1545870783",
    KeepTop: "6739556266",
    Keka: "470158793",
    "Key Codes": "414568915",
    "Menu Bar Calendar": "1558360383",
    Onigiri: "1639917298",
    "Pure Paste": "1611378436",
    "Signal Shifter": "6446061552",
  },
  uv: ["cyberdrop-dl-patched"],
} satisfies BrewPackages
