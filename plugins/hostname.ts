import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"

const hostname: StatefulPluginFactory<string, string> = (desired) => ({
  name: "hostname",
  current: async (ctx) => {
    if (ctx.os === "darwin") {
      return (await $`sudo scutil --get LocalHostName`.quiet()).text().trim()
    }
    return ""
  },
  change: (_, current) => (current === desired ? undefined : desired),
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