import path from "node:path"

import type { Host } from "tsinfra"

/** Makes the Dock's apps exactly `apps`, in order, given as `.app` paths. */
export const dock = async (h: Host, ...apps: string[]) => {
  const wanted = apps.map((app) => path.basename(app, ".app"))

  return h.ensure("Dock apps", {
    want: wanted,
    check: async ({ read }) => {
      const dockList = await read("dockutil --list")
      // Keep only pinned apps, because `dockutil --list` also lists recent apps that are running.
      // The first column is the app's name and the third is its Dock section.
      return dockList
        .split("\n")
        .map((line) => line.split("\t"))
        .filter((fields) => fields[2] === "persistentApps")
        .map((fields) => fields[0] ?? "")
    },
    fix: async ({ exec }) => {
      await exec("dockutil --remove all --no-restart")
      for (const app of apps) await exec(`dockutil --add "${app}" --no-restart`)
      await exec("killall Dock")
    },
  })
}
