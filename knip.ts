import { knipConfig } from "@adamhl8/configs"

// there is no src/: every TS file here is a graph root (an executable, a deployed dotfile, or a data module)
const config = knipConfig({
  project: ["!./archive/**/*"],
  // system binaries we shell out to, not things we could depend on
  ignoreBinaries: ["awk", "brew", "fish", "fnm", "openssl", "prettier", "sops"],
  // the deployed .prettierrc.mjs types itself against the globally-installed prettier
  ignoreDependencies: ["prettier"],
  entry: [
    "archive/incus-update/index.ts",
    "hosts/macbook/.prettierrc.mjs",
    "hosts/macbook/bin/*.ts",
    "incus/homepage/env.ts",
    "metal/serve.ts",
  ],
})

export default config
