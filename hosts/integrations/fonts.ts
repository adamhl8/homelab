import path from "node:path"

import { type } from "arktype"
import type { Host } from "tsinfra"

import type { Platform } from "#hosts/lib/facts.ts"
import { hostPlatform } from "#hosts/lib/facts.ts"

// Read the public releases API with `curl`, because `gh` needs a login even for a public repo.
const LATEST_RELEASE_URL = "https://api.github.com/repos/adamhl8/font-iosevka/releases/latest"
const FONTS_DIRS: Record<Platform, string> = { macos: "~/Library/Fonts", linux: "~/.local/share/fonts" }
// Use `shasum` on macOS because it has no `sha256sum` out of the box.
const HASH_COMMANDS: Record<Platform, string> = { macos: "shasum -a 256", linux: "sha256sum" }
// Matches a `shasum` or `sha256sum` line, like `50f83fdd...  /Users/adam/Library/Fonts/IosevkaNerdFont-Regular.ttf`.
const SHASUM_LINE = /^(?<hash>[0-9a-f]{64})\s+(?<file>\S+)$/v

const Release = type("string.json.parse").to({
  assets: type({ name: "string", digest: "string", browser_download_url: "string" }).array(),
})

/** Installs the `.ttf` files from the latest `adamhl8/font-iosevka` release, and replaces any that are out of date. */
export const iosevkaFonts = async (h: Host) => {
  const platform = await hostPlatform(h)
  const fontsDir = FONTS_DIRS[platform]
  const releaseJson = await h.read(`curl -fsSL ${LATEST_RELEASE_URL}`)
  const fonts = Release.assert(releaseJson).assets.filter(({ name }) => name.endsWith(".ttf"))

  // GitHub reports each asset's digest as `sha256:<hash>`.
  const latestDigests: Record<string, string> = Object.fromEntries(fonts.map(({ name, digest }) => [name, digest]))
  const downloadUrls: Record<string, string> = Object.fromEntries(
    fonts.map(({ name, browser_download_url }) => [name, browser_download_url]),
  )
  const names = Object.keys(latestDigests)
  const wanted = Object.fromEntries(names.map((name) => [name, "latest"]))
  const files = names.map((name) => `${fontsDir}/${name}`)

  return h.ensure("Iosevka fonts", {
    want: wanted,
    // Use `inspect` because the hash command exits non-zero when a file is missing, and still hashes the rest.
    // Leave out a missing file, so it shows as missing.
    check: async ({ inspect }) => {
      const { stdout } = await inspect(`${HASH_COMMANDS[platform]} ${files.join(" ")}`)

      return Object.fromEntries(
        stdout.split("\n").flatMap((line) => {
          const { hash, file } = SHASUM_LINE.exec(line)?.groups ?? {}
          if (!hash || !file) return []
          const name = path.basename(file)
          return [[name, latestDigests[name] === `sha256:${hash}` ? "latest" : "outdated"]]
        }),
      )
    },
    fix: async ({ exec }, { unmet }) => {
      for (const name of Object.keys(unmet))
        await exec(`curl -fsSL --create-dirs -o ${fontsDir}/${name} ${downloadUrls[name]}`)
    },
  })
}
