import path from "node:path"

import type { Host } from "tsinfra"

/** Makes the Dock's apps exactly `apps`, in order, given as `.app` paths. */
export const dock = async (h: Host, ...apps: string[]) => {
  const wanted = apps.map((app) => path.basename(app, ".app"))

  return h.ensure("Dock apps", {
    want: wanted,
    check: async ({ read }) => {
      const dockList = await read("dockutil --list")
      // Keep the first column of each line, which is the app's name.
      return dockList.split("\n").map((line) => line.split("\t")[0] ?? "")
    },
    fix: async ({ exec }) => {
      await exec("dockutil --remove all --no-restart")
      for (const app of apps) await exec(`dockutil --add "${app}" --no-restart`)
      await exec("killall Dock")
    },
  })
}
