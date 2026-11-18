import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  // tsinfra loads each host script's default export.
  overrides: [
    { files: ["hosts/*.ts"], rules: { "import/no-default-export": "off" } },
    // tsinfra steps run one at a time, so awaiting them in a loop is the only way to call them.
    { files: ["hosts/*.ts", "hosts/integrations/**/*.ts"], rules: { "no-await-in-loop": "off" } },
  ],
})

export default defineConfig(config)
