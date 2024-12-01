import type { BunInfraConfig } from "bun-infra/types"
import { brewCasks as brewCaskList } from "./data/brew-casks.ts"
import { brewFormulaList } from "./data/brew-formula.ts"
import { fisherPlugins } from "./data/fisher.ts"
import { links } from "./data/links.ts"
import { macAppIds } from "./data/mac-apps.ts"
import { fnm } from "./plugins/fnm.ts"
import { hostname } from "./plugins/hostname.ts"
import { installHomebrew } from "./plugins/install-homebrew.ts"
import { installRye } from "./plugins/install-rye.ts"
import { linkFiles } from "./plugins/link-files.ts"
import { macosDock } from "./plugins/macos-dock.ts"
import { brewCasks } from "./plugins/programs/brew-casks.ts"
import { brewFormula } from "./plugins/programs/brew-formula.ts"
import { macApps } from "./plugins/programs/mac-apps.ts"
import { sdkman } from "./plugins/sdkman.ts"
import { defaultShell } from "./plugins/shell/default-shell.ts"
import { fisher } from "./plugins/shell/fisher.ts"
import { installFish } from "./plugins/shell/install-fish.ts"
import { tideConfig } from "./plugins/shell/tide-config.ts"
import { sopsConfig } from "./plugins/sops-config.ts"
import { ssh } from "./plugins/ssh.ts"
import { defaultFileViewer } from "./plugins/utils/default-file-viewer.ts"
import { dockerLogin } from "./plugins/utils/docker-login.ts"
import { kekaHelper } from "./plugins/utils/keka-helper.ts"

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
      hostname("adam-macbook"),
      linkFiles(links),
      ssh(),
      macApps(macAppIds),
      sopsConfig(),
      installHomebrew(),
      installFish(),
      defaultShell("$HOMEBREW_PREFIX/bin/fish"),
      fisher(fisherPlugins),
      tideConfig("2 1 2 3 1 1 1 1 1 1 1"),
      installRye({}),
      brewFormula(brewFormulaList),
      brewCasks(brewCaskList),
      fnm(),
      sdkman(),
      kekaHelper(),
      defaultFileViewer("com.binarynights.ForkLift"),
      dockerLogin({
        registry: "ghcr.io",
        username: "adamhl8",
        sopsPasswordKey: "github_ghcr_token",
      }),
      macosDock(["ForkLift", "Zen Browser", "Obsidian", "Cursor", "WezTerm", "Slack", "Discord", "Windows App"]),
    ],
  },
} satisfies BunInfraConfig

export default config
