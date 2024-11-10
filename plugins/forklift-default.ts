import { $ } from "bun"
import type { StatelessPluginFactory } from "bun-infra/types/plugin"

const forkliftDefault: StatelessPluginFactory = () => ({
  name: "Forklift Default",
  handle: async () => {
    await $`defaults write -g NSFileViewer -string com.binarynights.ForkLift`.quiet()
    await $`defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType="public.folder";LSHandlerRoleAll="com.binarynights.ForkLift";}'`.quiet()
  },
  update: () => {
    return
  },
})

export { forkliftDefault }
