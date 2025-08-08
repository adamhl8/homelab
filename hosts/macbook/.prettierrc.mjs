/** @type {import("prettier").Config} */
// biome-ignore lint/style/noDefaultExport: prettier config
export default {
  printWidth: 120,
  semi: false,
  plugins: [
    "/Users/adam/.bun/install/global/node_modules/prettier-plugin-sh/lib/index.js",
    "/Users/adam/.bun/install/global/node_modules/prettier-plugin-toml/lib/index.js",
    "/Users/adam/.bun/install/global/node_modules/prettier-plugin-pkg/lib/index.js",
  ],
  overrides: [
    {
      // https://github.com/prettier/prettier/issues/15956
      files: ["*.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
  ],
}
