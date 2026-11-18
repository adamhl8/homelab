import type { Exec, Host } from "tsinfra"

const LIST_COMMAND = "bun pm ls -g"
// Matches a spec like `pnpm`, `pnpm@11`, or `@scope/name@1.2.3`.
// The optional prefix lets it match a `bun pm ls -g` line like `├── pnpm@11.28.11`.
// The header line never matches, because it has spaces after any prefix.
const PACKAGE_SPEC = /^(?:\S+ )?(?<name>@?[^\s@]+)(?:@(?<version>\S+))?$/v

// Matches the header line of `bun pm ls -g`, like `/Users/adam/.bun/install/global node_modules (5 installed)`.
const LIST_HEADER = /^(?<dir>.+) node_modules \(/v

const packageName = (spec: string): string => PACKAGE_SPEC.exec(spec)?.groups?.["name"] ?? spec

// Turns `bun pm ls -g` output into `[name, version]` pairs.
const parseGlobals = (output: string): [name: string, version: string][] =>
  output.split("\n").flatMap((line) => {
    const { name, version } = PACKAGE_SPEC.exec(line)?.groups ?? {}
    return name && version ? [[name, version]] : []
  })

// Deletes the global lockfile so `bun install` moves every package to the newest version its range allows.
// That covers transitive dependencies, and top-level packages whose installed version already satisfies their spec.
const refreshLockfile = async (exec: Exec): Promise<void> => {
  // Get the global dir from `bun pm ls -g` because bun has no command that prints it.
  const bunGlobalsOutput = await exec(LIST_COMMAND)
  const dir = LIST_HEADER.exec(bunGlobalsOutput)?.groups?.["dir"]
  if (!dir) throw new Error(`no global dir in the '${LIST_COMMAND}' header`)
  await exec(`rm -rf ${dir}/node_modules`)
  await exec(`rm -f ${dir}/bun.lock`)
  await exec(`bun install --cwd ${dir}`)
}

/**
 * Makes the global bun packages exactly `specs`, each on the newest version its spec allows. A spec is a bare name for
 * the `latest` tag, or a name with a range, like `pnpm@11`.
 */
export const bunGlobals = async (h: Host, ...specs: string[]) => {
  const specByName = Object.fromEntries(specs.map((spec) => [packageName(spec), spec]))

  const wanted: Record<string, string> = {}
  for (const spec of specs) wanted[spec] = await h.read(`bun info ${spec} version`)

  const packagesResult = await h.ensure("Bun global packages", {
    want: wanted,
    check: async ({ read }) => {
      const bunGlobalsOutput = await read(LIST_COMMAND)
      const installed = parseGlobals(bunGlobalsOutput)
      return Object.fromEntries(installed.map(([name, version]) => [specByName[name] ?? name, version]))
    },
    fix: async ({ exec }, { missing, extra, changed }) => {
      const installs = [...Object.keys(missing), ...Object.keys(changed)]
      if (installs.length > 0) await exec(`bun add -g ${installs.join(" ")}`)

      const removals = Object.keys(extra)
      if (removals.length > 0) await exec(`bun remove -g ${removals.join(" ")}`)

      await refreshLockfile(exec)
    },
  })

  // Refresh on every apply so transitive dependencies update even when every top-level package is current.
  await h.run("Refresh bun global lockfile", async ({ exec }) => refreshLockfile(exec), { after: "always" })

  return packagesResult
}
