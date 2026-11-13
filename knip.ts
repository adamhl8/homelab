import { knipConfig } from "@adamhl8/configs"

// there is no src/: every TS file here is a graph root (an executable, a deployed dotfile, or a data module)
const config = knipConfig({
  project: ["!./archive/**/*"],
  // system binaries we shell out to, not things we could depend on
  ignoreBinaries: ["adb", "awk", "brew", "fish", "fnm", "openssl", "sdkmanager", "sops"],
  // the deployed .prettierrc.mjs types itself against the globally-installed prettier
  ignoreDependencies: ["prettier"],
  entry: [
    "pyinfra/files/.prettierrc.mjs",
    "pyinfra/files/bin/*.ts",
    "pyinfra/incus/homepage/env.ts",
    "metal/serve.ts",
    "tv/build.ts",
  ],
})

export default config
