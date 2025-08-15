/** biome-ignore-all lint/performance/noAwaitInLoops: unbound/opnsense has strict rate limits */
import process from "node:process"
import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { SopsClient } from "~/tools/dns-overrides/sops.ts"
import type { NewOverride } from "~/tools/dns-overrides/unbound.ts"
import { UnboundClient } from "~/tools/dns-overrides/unbound.ts"

const CADDY_HOST = "caddy.lan"
const CADDY_SITEBLOCK_REGEX = /^(?<domain>\S+\.adamhl\.dev)\s*\{/gmv

async function getDomainsFromCaddyfile(caddyfilePath: string): Promise<Result<string[]>> {
  const caddyfileContent = await attempt(() => Bun.file(caddyfilePath).text())
  if (isErr(caddyfileContent)) return err("failed to read caddyfile", caddyfileContent)

  const matches = caddyfileContent.matchAll(CADDY_SITEBLOCK_REGEX)
  if (!matches) return err("No site blocks found in Caddyfile")

  const domains: string[] = []
  for (const match of matches) {
    const domain = match.groups?.["domain"]
    if (!domain || domain === "*.adamhl.dev") continue
    domains.push(domain)
  }

  return domains
}

async function updateDnsOverrides(): Promise<Result> {
  const args = process.argv.slice(2)
  const [caddyfilePath, secretsFilePath] = args
  if (!(caddyfilePath && secretsFilePath)) {
    return err("Usage: dns-overrides <caddyfile> <sops secrets>")
  }

  const domains = await getDomainsFromCaddyfile(caddyfilePath)
  if (isErr(domains)) return err("failed to get domains from Caddyfile", domains)

  const caddyIp = await attempt(async () => (await $`dig +short ${CADDY_HOST}`.text()).trim())
  if (isErr(caddyIp)) return err(`failed to resolve caddy IP for '${CADDY_HOST}'`, caddyIp)

  const overrides: NewOverride[] = domains.map((domain) => ({
    enabled: "1",
    hostname: "*",
    domain,
    rr: "A",
    mxprio: "",
    mx: "",
    server: caddyIp,
    description: "",
  }))

  const sopsClient = new SopsClient(secretsFilePath)
  const opnsenseKey = await sopsClient.get("opnsense_key")
  if (isErr(opnsenseKey)) return err("failed to get opnsense key", opnsenseKey)
  const opnsenseSecret = await sopsClient.get("opnsense_secret")
  if (isErr(opnsenseSecret)) return err("failed to get opnsense secret", opnsenseSecret)

  const unboundClient = new UnboundClient({
    opnsenseKey,
    opnsenseSecret,
  })

  const currentOverrides = await unboundClient.getOverrides()
  if (isErr(currentOverrides)) return currentOverrides

  console.info(`Deleting ${currentOverrides.length} existing overrides...`)
  for (const override of currentOverrides) {
    const deleteResult = await unboundClient.deleteOverride(override.uuid)
    if (isErr(deleteResult)) return err(`failed to delete override for '${override.domain}'`, deleteResult)
  }

  console.info(`Adding ${overrides.length} overrides...`)
  for (const override of overrides) {
    const addResult = await unboundClient.addOverride(override)
    if (isErr(addResult)) return err(`failed to add override for '${override.domain}'`, addResult)
  }

  const restartUnboundResult = await unboundClient.restartUnbound()
  if (isErr(restartUnboundResult)) return restartUnboundResult
  console.info("Restarted unbound")
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
