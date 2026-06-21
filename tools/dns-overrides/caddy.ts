import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

const CADDY_ADMIN_URL = "http://caddy.lan:2019"
const DOMAIN_REGEX = /^\S+\.adamhl\.dev$/v
const WILDCARD_DOMAIN = "*.adamhl.dev"
const EXCLUDED_DOMAINS = ["auth.adamhl.dev"]

function collectHosts(node: unknown, hosts: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectHosts(item, hosts)
    return
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "host" && Array.isArray(value)) {
        for (const host of value) if (typeof host === "string") hosts.add(host)
      }
      collectHosts(value, hosts)
    }
  }
}

export async function getCaddyDomains(): Promise<Result<string[]>> {
  const caddyConfigResponse = await attempt(() => fetch(`${CADDY_ADMIN_URL}/config/`))
  if (isErr(caddyConfigResponse))
    return err(`failed to reach caddy admin API at ${CADDY_ADMIN_URL}`, caddyConfigResponse)
  if (!caddyConfigResponse.ok)
    return err(
      `failed to get caddy config: (${caddyConfigResponse.status}) [${caddyConfigResponse.statusText}]`,
      undefined,
    )

  const caddyConfig = await attempt(() => caddyConfigResponse.json() as Promise<unknown>)
  if (isErr(caddyConfig)) return err("failed to parse caddy config JSON", caddyConfig)

  const hosts = new Set<string>()
  collectHosts(caddyConfig, hosts)

  const domains = [...hosts]
    .filter((host) => DOMAIN_REGEX.test(host) && host !== WILDCARD_DOMAIN && !EXCLUDED_DOMAINS.includes(host))
    .sort()
  if (domains.length === 0) return err("no *.adamhl.dev domains found in caddy config", undefined)

  return domains
}
