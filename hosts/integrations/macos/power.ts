import type { Host } from "tsinfra"

type PowerSource = "ac" | "battery"
type PowerSettings = Partial<Record<PowerSource, Record<string, number>>>

const SOURCE_FLAGS: Record<PowerSource, string> = { ac: "-c", battery: "-b" }
const SOURCE_HEADERS: Record<string, PowerSource> = { "AC Power:": "ac", "Battery Power:": "battery" }
// Matches a setting line of `pmset -g custom`, like ` displaysleep         10`.
// It skips a line like `Sleep On Power Button 1`, because that label isn't a `pmset` argument.
const SETTING_LINE = /^ (?<key>\S+)\s+(?<value>\S+)$/v

// Turns `pmset -g custom` output into keys like `ac displaysleep`.
const parsePmset = (output: string): Record<string, number> => {
  const settings: Record<string, number> = {}
  let source: PowerSource | undefined
  for (const line of output.split("\n")) {
    source = SOURCE_HEADERS[line.trim()] ?? source
    const { key, value } = SETTING_LINE.exec(line)?.groups ?? {}
    if (source && key && value) settings[`${source} ${key}`] = Number(value)
  }
  return settings
}

/** Sets `pmset` settings for each power source, like `{ ac: { sleep: 0 }, battery: { displaysleep: 2 } }`. */
export const power = async (h: Host, settings: PowerSettings) => {
  const wanted = Object.fromEntries(
    Object.entries(settings).flatMap(([source, values]) =>
      Object.entries(values).map(([key, value]) => [`${source} ${key}`, value]),
    ),
  )

  return h.ensure("Power settings", {
    want: wanted,
    check: async ({ read }) => {
      const pmsetOutput = await read("pmset -g custom")
      const current = parsePmset(pmsetOutput)
      // Keep only the managed keys, because `pmset` reports every setting.
      return Object.fromEntries(Object.entries(current).filter(([key]) => key in wanted))
    },
    fix: async ({ exec }, { unmet }) => {
      for (const source of ["ac", "battery"] as const) {
        const args = Object.entries(unmet)
          .filter(([key]) => key.startsWith(`${source} `))
          .map(([key, value]) => `${key.slice(source.length + 1)} ${value}`)
        if (args.length > 0) await exec(`sudo pmset ${SOURCE_FLAGS[source]} ${args.join(" ")}`)
      }
    },
  })
}
