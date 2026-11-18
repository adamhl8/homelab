import { type } from "arktype"
import type { Host } from "tsinfra"
import { PUBLIC_EXECUTABLE_MODE } from "tsinfra"

/** The packages to keep installed, by Brewfile entry type. */
export interface BrewPackages {
  taps?: string[]
  brews?: string[]
  casks?: string[]
  /** App Store apps, as `{ name: id }`. */
  mas?: Record<string, string>
  uv?: string[]
}

interface BrewOptions {
  /** Runs `brew update --force` first, so the steps after it see the newest versions. */
  updateBrew?: boolean
  /** Upgrades every outdated formula and cask, dependencies included. It doesn't upgrade App Store apps or uv tools. */
  upgrade?: boolean
  /** With `upgrade`, also upgrades casks that update themselves. */
  greedy?: boolean
  /** Installs over apps and files brew didn't put there, instead of failing. */
  force?: boolean
  /** Gives brew the sudo password, for casks that run an installer or uninstaller as root. */
  sudoPassword?: string
}

const ASKPASS_PATH = "~/.local/share/brew/askpass"
// Name the variable `HOMEBREW_*` because `bin/brew` drops every other variable.
// Keep "PASSWORD" in it so brew hides it from cask and formula code while loading them.
const ASKPASS_HELPER = `#!/bin/sh\nprintf '%s\\n' "$HOMEBREW_SUDO_PASSWORD"\n`

const formulaEntry = (name: string) => `brew "${name}"`
const caskEntry = (name: string) => `cask "${name}"`

// Reads `brew outdated --json=v2` into entries like `brew "git"`.
// Leave out pinned formulae because `brew upgrade` skips them.
// Leave out `version :latest` casks because `--greedy` always lists them, even right after an upgrade.
const OutdatedEntries = type("string.json.parse")
  .to({
    formulae: type({ name: "string", pinned: "boolean" }).array(),
    casks: type({ name: "string", current_version: "string" }).array(),
  })
  .pipe(({ formulae, casks }) => [
    ...formulae.filter(({ pinned }) => !pinned).map(({ name }) => formulaEntry(name)),
    ...casks.filter(({ current_version }) => current_version !== "latest").map(({ name }) => caskEntry(name)),
  ])

// Turns Brewfile lines into entries like `brew "git"`, cut at the first comma to drop options like `id:`.
const parseEntries = (brewfile: string): Set<string> =>
  new Set(
    brewfile
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(",")[0] ?? line),
  )

/** Installs `packages`, removes anything installed outside them, and cleans up after a change. */
export const brewPackages = async (h: Host, packages: BrewPackages, options: BrewOptions = {}) => {
  const { taps = [], brews = [], casks = [], mas = {}, uv = [] } = packages
  const { updateBrew = false, upgrade = false, greedy = false, force = false, sudoPassword } = options
  const greedyFlag = greedy ? " --greedy" : ""
  const forceFlag = force ? " --force" : ""

  // Point brew's own `sudo` calls at the helper, because tsinfra's `sudo` function doesn't reach them.
  if (sudoPassword !== undefined) await h.file(ASKPASS_PATH, ASKPASS_HELPER, { mode: PUBLIC_EXECUTABLE_MODE })
  const askpass = sudoPassword === undefined ? "" : `SUDO_ASKPASS=${ASKPASS_PATH} `
  const sudoEnv = sudoPassword === undefined ? {} : { HOMEBREW_SUDO_PASSWORD: sudoPassword }

  // Trust each tap because Homebrew only loads formulae and casks from a non-official tap you trust.
  const brewfile = [
    ...taps.map((tap) => `tap "${tap}", trusted: true`),
    ...brews.map(formulaEntry),
    ...casks.map(caskEntry),
    ...Object.entries(mas).map(([name, id]) => `mas "${name}", id: ${id}`),
    ...uv.map((tool) => `uv "${tool}"`),
  ].join("\n")
  const wanted = parseEntries(brewfile)

  if (updateBrew) await h.run("Update Homebrew", "brew update --force", { after: "always" })

  const packagesResult = await h.ensure("Brew packages", {
    want: wanted,
    // Use `brew bundle dump` because it prints what's installed in the Brewfile format.
    check: async ({ read }) => {
      const dump = await read("brew bundle dump --file=-")
      return parseEntries(dump)
    },
    fix: async ({ exec }, { missing, extra }) => {
      if (missing.length > 0) await exec(`${askpass}brew bundle install${forceFlag} --file=-`, { input: brewfile })
      if (extra.length > 0) await exec(`${askpass}brew bundle cleanup --force --file=-`, { input: brewfile })
    },
    // Keep this step from upgrading, so the plan shows upgrades only in the upgrade step.
    env: { HOMEBREW_BUNDLE_NO_UPGRADE: "1" },
    secretEnv: sudoEnv,
  })

  const changeResults = [packagesResult]

  if (upgrade) {
    // List what's left to upgrade, because `brew outdated` also covers dependencies that aren't listed.
    const upgradeResult = await h.ensure("Upgrade brew packages", {
      needs: [packagesResult],
      want: [],
      check: async ({ read }) => {
        const outdatedJson = await read(`brew outdated --json=v2${greedyFlag}`)
        return OutdatedEntries.assert(outdatedJson)
      },
      fix: `${askpass}brew upgrade${greedyFlag}`,
      secretEnv: sudoEnv,
    })

    changeResults.push(upgradeResult)
  }

  await h.run("Remove unused brew dependencies", "brew autoremove", { after: changeResults })
  await h.run("Remove old brew versions and downloads", "brew cleanup --prune=all --scrub", { after: changeResults })
}
