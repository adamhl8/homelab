#!/usr/bin/env bun

import { sesame } from "sesame"
import {
  brewCasks,
  brewFormula,
  defaultFileViewer,
  defaultShell,
  dockerLogin,
  fisher,
  fnm,
  hostname,
  installFish,
  installHomebrew,
  installRye,
  kekaHelper,
  linkFiles,
  macApps,
  macosDock,
  sdkman,
  sopsConfig,
  ssh,
  tideConfig,
} from "sesame/plugins"
import type { BunInfraConfig } from "sesame/types"
import { brewCasks as brewCaskList } from "./data/brew-casks.ts"
import { brewFormulaList } from "./data/brew-formula.ts"
import { fisherPlugins } from "./data/fisher.ts"
import { links } from "./data/links.ts"
import { macAppIds } from "./data/mac-apps.ts"

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

await sesame(config)
