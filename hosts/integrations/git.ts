import type { Host } from "tsinfra"

/** Sets each git config key in `settings` to its value in the repo at `repo`. */
export const gitConfig = async (h: Host, repo: string, settings: Record<string, string>) =>
  h.ensure("Git config", {
    want: settings,
    check: async ({ inspect }) => {
      const results = await Promise.all(
        Object.keys(settings).map(async (key) => [key, await inspect(`git -C ${repo} config --get ${key}`)] as const),
      )
      // Leave out an unset key, because `git config --get` exits 1 for it.
      const setResults = results.filter(([, { exitCode }]) => exitCode === 0)
      return Object.fromEntries(setResults.map(([key, { stdout }]) => [key, stdout]))
    },
    fix: async ({ exec }, { unmet }) => {
      for (const [key, value] of Object.entries(unmet)) await exec(`git -C ${repo} config ${key} "${value}"`)
    },
  })
