import process from "node:process"

import { type } from "arktype"
import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr, messageChain } from "ts-explicit-errors"

/** Maps each sops key to its homepage env var, without the `HOMEPAGE_VAR_` prefix */
const SECRET_TO_ENV: Record<string, string> = {
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
}

const secretsSchema = type("string.json.parse").to("Record<string, string>")

const getSecrets = async (): Promise<Result<Record<string, string>>> => {
  const secretsJson = await attempt(async () => $`sops -d --output-type json ~/homelab/secrets/credentials.yaml`.text())
  if (isErr(secretsJson)) return err("failed to decrypt the credentials", secretsJson)

  const validSecrets = secretsSchema(secretsJson)
  if (validSecrets instanceof type.errors) return err(`invalid secrets: ${validSecrets.summary}`, undefined)

  return validSecrets
}

const printEnv = async (): Promise<Result> => {
  const secrets = await getSecrets()
  if (isErr(secrets)) return secrets

  for (const [key, envVar] of Object.entries(SECRET_TO_ENV)) {
    const secret = secrets[key]
    if (!secret) return err(`missing secret '${key}'`, undefined)
    console.log(`HOMEPAGE_VAR_${envVar}=${secret}`)
  }
}

const main = async (): Promise<number> => {
  const result = await printEnv()
  if (isErr(result)) {
    console.error(messageChain(result))
    return 1
  }

  return 0
}

process.exitCode = await main()
