import type { Host } from "tsinfra"

type DefaultsValue = boolean | number | string
export type MacosDefaults = Record<string, Record<string, DefaultsValue>>

// Reads a `defaults read` value as the type of its wanted value.
// `defaults read` prints a boolean as `1` or `0`.
const parseValue = (output: string, wanted: DefaultsValue): DefaultsValue => {
  if (typeof wanted === "boolean") return output === "1"
  if (typeof wanted === "number") return Number(output)
  return output
}

const writeArgs = (value: DefaultsValue): string => {
  if (typeof value === "boolean") return `-bool ${value}`
  if (typeof value === "number") return Number.isInteger(value) ? `-int ${value}` : `-float ${value}`
  // Quote a string because a value like `#221448` would start a shell comment.
  return `-string "${value}"`
}

/** Sets each `defaults` key in `settings`, given as `{ domain: { key: value } }`. */
export const macosDefaults = async (h: Host, settings: MacosDefaults) => {
  const entries = Object.entries(settings).flatMap(([domain, keys]) =>
    Object.entries(keys).map(([key, value]) => ({ id: `${domain} ${key}`, domain, key, value })),
  )
  const entryById = new Map(entries.map((entry) => [entry.id, entry]))
  const wanted = Object.fromEntries(entries.map(({ id, value }) => [id, value]))

  return h.ensure("macOS defaults", {
    want: wanted,
    check: async ({ inspect }) => {
      const results = await Promise.all(
        entries.map(async (entry) => ({ entry, result: await inspect(`defaults read ${entry.domain} ${entry.key}`) })),
      )
      // Leave out an unset key, because `defaults read` exits 1 for it.
      const setResults = results.filter(({ result }) => result.exitCode === 0)
      return Object.fromEntries(
        setResults.map(({ entry, result }) => [entry.id, parseValue(result.stdout, entry.value)]),
      )
    },
    fix: async ({ exec }, { missing, changed }) => {
      const updates = [...Object.keys(missing), ...Object.keys(changed)]
      for (const id of updates) {
        const entry = entryById.get(id)
        if (entry) await exec(`defaults write ${entry.domain} ${entry.key} ${writeArgs(entry.value)}`)
      }
    },
  })
}
