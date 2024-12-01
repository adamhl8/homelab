/** @type {import("prettier").Options} */
export default {
	printWidth: 120,
	semi: false,
	plugins: [
		"/Users/adam/.bun/install/global/node_modules/prettier-plugin-sh/lib/index.js",
		"/Users/adam/.bun/install/global/node_modules/prettier-plugin-toml/lib/index.js",
	],
	// https://github.com/prettier/prettier/issues/15956
	overrides: [
		{
			files: ["*.jsonc"],
			options: {
				trailingComma: "none",
			},
		},
	],
};
