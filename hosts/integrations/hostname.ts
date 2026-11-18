import type { Host } from "tsinfra"

import type { Platform } from "#hosts/lib/facts.ts"
import { hostPlatform } from "#hosts/lib/facts.ts"

interface HostnameTools {
  read: (key: string) => string
  write: (key: string, value: string) => string
}

const TOOLS: Record<Platform, HostnameTools> = {
  macos: {
    read: (key) => `scutil --get ${key}`,
    write: (key, value) => `sudo scutil --set ${key} "${value}"`,
  },
  linux: {
    read: (key) => `hostnamectl --${key} hostname`,
    write: (key, value) => `sudo hostnamectl --${key} hostname "${value}"`,
  },
}

/**
 * Sets the host's network name to `name`, and its display name to `computerName`. On macOS, `name` sets `HostName` and
 * `LocalHostName`, and `computerName` sets `ComputerName`. On Linux, they set the static and pretty hostnames.
 */
export const hostname = async (h: Host, name: string, computerName: string) => {
  const platform = await hostPlatform(h)
  const tools = TOOLS[platform]
  const wanted: Record<string, string> =
    platform === "macos"
      ? { HostName: name, LocalHostName: name, ComputerName: computerName }
      : { static: name, pretty: computerName }

  return h.ensure("Hostname", {
    want: wanted,
    check: async ({ inspect }) => {
      const results = await Promise.all(
        Object.keys(wanted).map(async (key) => [key, await inspect(tools.read(key))] as const),
      )
      // Leave out an unset name, because `scutil --get` exits non-zero for it.
      // Leave out an empty one, because `hostnamectl` prints nothing for an unset pretty hostname.
      const setResults = results.filter(([, { exitCode, stdout }]) => exitCode === 0 && stdout !== "")
      return Object.fromEntries(setResults.map(([key, { stdout }]) => [key, stdout]))
    },
    fix: async ({ exec }, { missing, changed }) => {
      const updates = Object.entries(wanted).filter(([key]) => key in missing || key in changed)
      for (const [key, value] of updates) await exec(tools.write(key, value))
    },
  })
}
