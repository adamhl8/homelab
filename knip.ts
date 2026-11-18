import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  // Ignore the system binaries the scripts shell out to because no package provides them.
  ignoreBinaries: ["adb", "brew", "fish", "fnm", "openssl", "sdkmanager", "sops"],
  // Ignore `prettier` because the deployed `.prettierrc.mjs` types itself against the global install.
  ignoreDependencies: ["prettier"],
  // List every script as a runtime entry because there is no `src/` and each one runs on its own.
  entry: [
    "archive/incus-update/index.ts!",
    "hosts/*.ts!",
    "hosts/files/.prettierrc.mjs!",
    "hosts/files/bin/*.ts!",
    "incus/homepage/env.ts!",
    "metal/serve.ts!",
    "tv/build.ts!",
  ],
})

export default config
