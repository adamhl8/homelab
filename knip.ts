import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  entry: [
    "./data/*.ts",
    "./hosts/macbook/.prettierrc.mjs",
    "./hosts/macbook/bin/*.ts",
    "./scripts/*.ts",
    "./scripts/iosevka-font-builder/run.ts",
    "./sesame.ts",
    "./tools/*/index.ts",
  ],
  ignore: ["./archive/**/*"],
  ignoreBinaries: [/.*/],
} as const)

export default config
