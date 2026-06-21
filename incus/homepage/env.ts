import { $ } from "bun"

/** sops key -> homepage env var (without HOMEPAGE_VAR_ prefix) */
const SECRET_TO_ENV = {
  immich_key: "IMMICH",
  jellyfin_api_key: "JELLYFIN",
  seerr_api_key: "SEERR",
  radarr_api_key: "RADARR",
  sonarr_api_key: "SONARR",
  prowlarr_api_key: "PROWLARR",
  unifi_homepage_password: "UNIFI",
  homelab_password: "QBITTORRENT",
  tailscale_homepage_api_key: "TAILSCALE",
  filebrowser_homepage_password: "FILE_BROWSER",
  papra_homepage_api_key: "PAPRA",
} as const

const json = await $`sops -d --output-type json ~/secrets.yaml`.text()
const secrets: Record<string, string> = JSON.parse(json)

for (const [key, envVar] of Object.entries(SECRET_TO_ENV)) {
  const secret = secrets[key]
  if (!secret) throw new Error(`missing secret: ${key}`)
  console.log(`HOMEPAGE_VAR_${envVar}=${secret}`)
}
