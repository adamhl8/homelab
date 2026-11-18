import { type } from "arktype"
import type { Host } from "tsinfra"

const LAUNCH_SERVICES_PLIST = "~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist"
const LS_DOMAIN = "com.apple.LaunchServices/com.apple.launchservices.secure"

const Handlers = type("string.json.parse").to(
  type({ "LSHandlerContentType?": "string", "LSHandlerRoleAll?": "string" }).array(),
)

/** Sets the app that opens each content type in `handlers`, given as `{ contentType: bundleId }`. */
export const fileHandlers = async (h: Host, handlers: Record<string, string>) => {
  // Lowercase the bundle IDs because Launch Services stores them lowercased.
  const wanted = Object.fromEntries(
    Object.entries(handlers).map(([contentType, bundleId]) => [contentType, bundleId.toLowerCase()]),
  )

  return h.ensure("File handlers", {
    want: wanted,
    check: async ({ read }) => {
      const handlersJson = await read(`plutil -extract LSHandlers json -o - ${LAUNCH_SERVICES_PLIST}`)
      const current: Record<string, string> = {}
      for (const handler of Handlers.assert(handlersJson)) {
        const { LSHandlerContentType: contentType, LSHandlerRoleAll: bundleId } = handler
        if (contentType && bundleId && contentType in wanted) current[contentType] = bundleId.toLowerCase()
      }
      return current
    },
    // Add an entry, because `defaults` can't edit one entry inside the `LSHandlers` array.
    fix: async ({ exec }, { missing, changed }) => {
      const updates = [...Object.keys(missing), ...Object.keys(changed)]
      for (const contentType of updates) {
        const entry = `{LSHandlerContentType="${contentType}";LSHandlerRoleAll="${wanted[contentType]}";}`
        await exec(`defaults write ${LS_DOMAIN} LSHandlers -array-add '${entry}'`)
      }
    },
  })
}
