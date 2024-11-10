import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

const hostname: StatefulPluginFactory<string, string> = (hostname) => ({
  name: "hostname",
  desired: hostname,
  current: async (ctx) => {
    if (ctx.os === "darwin") {
      return (await $`sudo scutil --get LocalHostName`.quiet()).text().trim()
    }
    return ""
  },
  change: (_, current) => (current === hostname ? undefined : hostname),
  handle: async (ctx, change) => {
    if (ctx.os === "darwin") {
      await $`sudo scutil --set HostName ${change}`
      await $`sudo scutil --set LocalHostName ${change}`
    }
  },
  update: () => {
    return
  },
})

export { hostname }
