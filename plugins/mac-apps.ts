import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

type AppInfo = readonly [string, string]

interface macAppsChange {
  added: AppInfo[]
  removed: AppInfo[]
}

const appIdSplit = /\s+/

// executing application must have permissions to manage apps

const macApps: StatefulPluginFactory<string[], macAppsChange> = (apps) => ({
  name: "Mac Apps",
  desired: () => apps,
  current: async () => {
    return (await $`mas list`.quiet())
      .text()
      .trim()
      .split("\n")
      .map((line) => line.split(appIdSplit)[0] ?? "")
      .filter(Boolean)
  },
  change: async (_, __, current, apps) => {
    const currentSet = new Set(current)
    const desiredSet = new Set(apps)

    const added = apps.filter((x) => !currentSet.has(x))
    const removed = current.filter((x) => !desiredSet.has(x))
    if (added.length === 0 && removed.length === 0) return

    const getAppName = async (appId: string) => {
      return (await $`mas info ${appId}`.quiet()).text().trim().split("\n")[0] ?? ""
    }

    const addedAppsPromises = added.map(async (appId) => [await getAppName(appId), appId] as const)
    const removedAppsPromises = removed.map(async (appId) => [await getAppName(appId), appId] as const)
    const [addedApps, removedApps] = await Promise.all([
      Promise.all(addedAppsPromises),
      Promise.all(removedAppsPromises),
    ])
    return { added: addedApps, removed: removedApps }
  },
  handle: async (_, change) => {
    if (change.removed.length > 0) {
      for (const [, appId] of change.removed) await $`sudo mas uninstall ${appId}`
    }
    if (change.added.length > 0) {
      for (const [, appId] of change.added) await $`mas install ${appId}`
    }
  },
  update: async () => {
    await $`mas upgrade`
  },
})

export { macApps }
