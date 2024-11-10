import path from "node:path"
import { Glob } from "bun"
import type { BunInfraConfig } from "bun-infra/types"
import { brewCasks as brewCaskList } from "./data/brew-casks.ts"
import { brewCasks } from "./plugins/brew-casks.ts"
import { brewFormula } from "./plugins/brew-formula.ts"
import { forkliftDefault } from "./plugins/forklift-default.ts"
import { hostname } from "./plugins/hostname.ts"
import { installFish } from "./plugins/install-fish.ts"
import { installHomebrew } from "./plugins/install-homebrew.ts"
import { installRye } from "./plugins/install-rye.ts"
import { kekaHelper } from "./plugins/keka-helper.ts"
import { linkFiles } from "./plugins/link-files.ts"
import { macApps } from "./plugins/mac-apps.ts"
import { sopsConfig } from "./plugins/sops-config.ts"
import { ssh } from "./plugins/ssh.ts"
import { resolveLocalPath } from "./utils/paths.ts"

const brewFormulaList = [
  "age",
  "bash",
  "bat",
  "caddy",
  "coreutils",
  "cocoapods",
  "curl",
  "delve",
  "diffutils",
  "dua-cli",
  "eza",
  "fclones",
  "fd",
  "ffmpeg",
  "findutils",
  "fish",
  "fzf",
  "gawk",
  "git",
  "git-delta",
  "git-lfs",
  "gnu-sed",
  "gnu-tar",
  "go",
  "grep",
  "gzip",
  "jq",
  "just",
  "ko",
  "mas",
  "micro",
  "sops",
  "unzip",
  "wget",
  "xq",
  "yq",
  "zip",
]

const links = [
  { source: "configs/config.fish", dest: "~/.config/fish/" },
  { source: "configs/secrets.yaml", dest: "~/" },
  { source: "configs/authorized_keys", dest: "~/.ssh/" },
  { source: "configs/allowed_signers", dest: "~/.ssh/" },
  { source: "hosts/macbook/.wezterm.lua", dest: "~/" },
  { source: "hosts/macbook/.gitconfig-swf", dest: "~/" },
  { source: "hosts/macbook/DefaultKeyBinding.dict", dest: "~/Library/KeyBindings/" },
  { source: "hosts/macbook/bin/*", dest: "~/bin/" },
]

const macAppIds = [
  "1099120373", // ProtonMail Exporter
  "1639917298", // Onigiri
  "1295203466", // Windows App
  "1545870783", // System Color Picker
  "414568915", // Key Codes
  "1558360383", // Menu Bar Calendar
  "490179405", // Okta Verify
  "1193539993", // Brother iPrint Scan
  "470158793", // Keka
  "1565701763", // AudioWrangler
  "6446061552", // Signal Shifter
  "1611378436", // Pure Paste
]

const config = {
  sid: {
    host: "sid.lan",
    user: "adam",
    port: 22, // todo: should just be part of host
    plugins: [],
  },
  "adam-macbook": {
    host: "localhost",
    plugins: [
      // hostname("adam-macbook"),
      // linkFiles(links),
      ssh(),
      macApps(macAppIds),
      // sopsConfig(),
      // installHomebrew(),
      // installFish({ fishConfigPath: "configs/config.fish" }),
      // installRye(),
      // brewFormula(brewFormulaList),
      // brewCasks(brewCaskList),
      kekaHelper(),
      forkliftDefault(),
    ],
  },
} satisfies BunInfraConfig

export default config
