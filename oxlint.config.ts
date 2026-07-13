import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  rules: {
    // this repo asserts the shape of untyped JSON from external APIs (Incus, GitHub, sops) throughout
    "typescript/no-unsafe-type-assertion": "off",
  },
  overrides: [
    {
      // prettier requires its config to be a default export
      files: ["hosts/macbook/.prettierrc.mjs"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      // `useFormatters` is not a React hook, it just shares the `use` prefix
      files: ["hosts/macbook/bin/format-wrapper.ts"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
})

export default defineConfig(config)
