import type { Result } from "ts-explicit-errors"
import { err } from "ts-explicit-errors"

const UNIFI_API_BASE = "https://ucg-fiber.lan/proxy/network/integration/v1"
const PAGE_LIMIT = 200
const A_RECORD_TTL_SECONDS = 1

interface DnsPolicy {
  id: string
  type: string
  enabled: boolean
  domain: string
  ipv4Address?: string
}

interface ApiPage<T> {
  offset: number
  limit: number
  count: number
  totalCount: number
  data: T[]
}

interface Site {
  id: string
  internalReference: string
  name: string
}

export class UnifiClient {
  readonly #apiKey: string

  public constructor(apiKey: string) {
    this.#apiKey = apiKey
  }

  #authFetch(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${UNIFI_API_BASE}${path}`, {
      ...options,
      tls: { rejectUnauthorized: false },
      headers: {
        "X-API-KEY": this.#apiKey,
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  }

  public async resolveSiteId(): Promise<Result<string>> {
    const response = await this.#authFetch("/sites")
    const page = (await response.json()) as ApiPage<Site>
    if (!(response.ok && Array.isArray(page.data)))
      return err(
        `failed to get sites: (${response.status}) [${response.statusText}] ${JSON.stringify(page)}`,
        undefined,
      )

    const site = page.data.find((s) => s.internalReference === "default") ?? page.data[0]
    if (!site) return err("no unifi sites found", undefined)

    return site.id
  }

  public async getDnsPolicies(siteId: string): Promise<Result<DnsPolicy[]>> {
    const policies: DnsPolicy[] = []
    let total = Number.POSITIVE_INFINITY
    while (policies.length < total) {
      // biome-ignore lint/performance/noAwaitInLoops: pagination is inherently sequential
      const response = await this.#authFetch(
        `/sites/${siteId}/dns/policies?offset=${policies.length}&limit=${PAGE_LIMIT}`,
      )
      const page = (await response.json()) as ApiPage<DnsPolicy>
      if (!(response.ok && Array.isArray(page.data)))
        return err(
          `failed to get dns policies: (${response.status}) [${response.statusText}] ${JSON.stringify(page)}`,
          undefined,
        )

      if (page.data.length === 0) break
      policies.push(...page.data)
      total = page.totalCount
    }

    return policies
  }

  public async createARecord(siteId: string, domain: string, ipv4Address: string): Promise<Result<void>> {
    const response = await this.#authFetch(`/sites/${siteId}/dns/policies`, {
      method: "POST",
      body: JSON.stringify({ type: "A_RECORD", enabled: true, domain, ipv4Address, ttlSeconds: A_RECORD_TTL_SECONDS }),
    })
    if (!response.ok)
      return err(
        `failed to create A record for '${domain}': (${response.status}) [${response.statusText}] ${await response.text()}`,
        undefined,
      )
  }

  public async deleteDnsPolicy(siteId: string, id: string): Promise<Result<void>> {
    const response = await this.#authFetch(`/sites/${siteId}/dns/policies/${id}`, { method: "DELETE" })
    // 404 means the record is already gone
    if (!(response.ok || response.status === 404))
      return err(
        `failed to delete dns policy '${id}': (${response.status}) [${response.statusText}] ${await response.text()}`,
        undefined,
      )
  }
}
