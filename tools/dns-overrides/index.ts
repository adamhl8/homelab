/** biome-ignore-all lint/performance/noAwaitInLoops: keep DNS policy writes sequential */
import process from "node:process"
import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { getCaddyDomains } from "~/tools/dns-overrides/caddy.ts"
import { UnifiClient } from "~/tools/dns-overrides/unifi.ts"

const CADDY_HOST = "caddy.lan"
const MANAGED_DOMAIN_REGEX = /\.adamhl\.dev$/v

async function updateDnsOverrides(): Promise<Result> {
  const apiKey = process.env["UNIFI_API_KEY"]
  if (!apiKey) return err("UNIFI_API_KEY is not set", undefined)

  const domains = await getCaddyDomains()
  if (isErr(domains)) return err("failed to get domains from caddy", domains)

  const caddyIp = await attempt(async () => (await $`dig +short ${CADDY_HOST}`.text()).trim())
  if (isErr(caddyIp)) return err(`failed to resolve caddy IP for '${CADDY_HOST}'`, caddyIp)
  if (!caddyIp) return err(`'${CADDY_HOST}' did not resolve to an IP`, undefined)

  const client = new UnifiClient(apiKey)

  const siteId = await client.resolveSiteId()
  if (isErr(siteId)) return err("failed to resolve unifi site", siteId)

  const policies = await client.getDnsPolicies(siteId)
  if (isErr(policies)) return err("failed to get existing dns policies", policies)

  const managed = policies.filter((p) => p.type === "A_RECORD" && MANAGED_DOMAIN_REGEX.test(p.domain))

  console.info(`Deleting ${managed.length} existing overrides...`)
  for (const policy of managed) {
    const deleteResult = await client.deleteDnsPolicy(siteId, policy.id)
    if (isErr(deleteResult)) return err(`failed to delete override for '${policy.domain}'`, deleteResult)
  }

  console.info(`Adding ${domains.length} overrides...`)
  for (const domain of domains) {
    const addResult = await client.createARecord(siteId, domain, caddyIp)
    if (isErr(addResult)) return err(`failed to add override for '${domain}'`, addResult)
  }

  console.info("Done")
}

async function main(): Promise<number> {
  const result = await updateDnsOverrides()
  if (isErr(result)) {
    console.error(result.messageChain)
    return 1
  }
  return 0
}

process.exitCode = await main()
