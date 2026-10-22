import { type } from "arktype"
import { $ } from "bun"

const secretsSchema = type("Record<string, string>")

/** Sops key -> homepage env var (without HOMEPAGE_VAR_ prefix) */
const SECRET_TO_ENV = {
  immich_key: "IMMICH",
  jellyfin_api_key: "JELLYFIN",
  seerr_api_key: "SEERR",
  radarr_api_key: "RADARR",
  sonarr_api_key: "SONARR",
  prowlarr_api_key: "PROWLARR",
  unifi_homepage_api_key: "UNIFI",
  homelab_password: "QBITTORRENT",
  tailscale_homepage_api_key: "TAILSCALE",
  papra_homepage_api_key: "PAPRA",
} as const

const json = await $`sops -d --output-type json ~/homelab/secrets/credentials.yaml`.text()
const secrets = secretsSchema(JSON.parse(json))
if (secrets instanceof type.errors) throw new Error(`invalid secrets: ${secrets.summary}`)

for (const [key, envVar] of Object.entries(SECRET_TO_ENV)) {
  const secret = secrets[key]
  if (!secret) throw new Error(`missing secret: ${key}`)
  console.log(`HOMEPAGE_VAR_${envVar}=${secret}`)
}
