import type { Result } from "ts-explicit-errors"
import { err } from "ts-explicit-errors"

export interface NewOverride {
  enabled: string
  hostname: string
  domain: string
  rr: string
  mxprio: string
  mx: string
  server: string
  description: string
}

interface Override extends NewOverride {
  uuid: string
  ttl: string
}

const OPNSENSE_UNBOUND_URL = "http://opnsense.lan/api/unbound"

export class UnboundClient {
  readonly #baseUrl: string
  readonly #opnsenseKey: string
  readonly #opnsenseSecret: string

  public constructor({ opnsenseKey, opnsenseSecret }: { opnsenseKey: string; opnsenseSecret: string }) {
    this.#baseUrl = OPNSENSE_UNBOUND_URL
    this.#opnsenseKey = opnsenseKey
    this.#opnsenseSecret = opnsenseSecret
  }

  #authFetch(path: string, options: RequestInit = {}) {
    return fetch(`${this.#baseUrl}/${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Basic ${Buffer.from(`${this.#opnsenseKey}:${this.#opnsenseSecret}`).toString("base64")}`,
      },
    })
  }

  public async getOverrides(): Promise<Result<Override[]>> {
    const currentOverridesResponse = await this.#authFetch("settings/searchHostOverride", {
      method: "GET",
    })
    const currentOverrides = (await currentOverridesResponse.json()) as { rows: Override[] }

    if (!(currentOverridesResponse.ok && currentOverrides.rows))
      return err(
        `failed to get overrides: (${currentOverridesResponse.status}) [${currentOverridesResponse.statusText}] ${JSON.stringify(currentOverrides)}`,
      )

    return currentOverrides.rows
  }

  public async deleteOverride(uuid: string): Promise<Result<void>> {
    const deleteOverrideResponse = await this.#authFetch(`settings/delHostOverride/${uuid}`, {
      method: "POST",
    })
    const deleteOverride = (await deleteOverrideResponse.json()) as { result: string }

    if (!(deleteOverrideResponse.ok && deleteOverride.result === "deleted"))
      return err(
        `failed to delete override for '${uuid}': (${deleteOverrideResponse.status}) [${deleteOverrideResponse.statusText}] ${JSON.stringify(deleteOverride)}`,
      )
  }

  public async addOverride(override: NewOverride): Promise<Result<void>> {
    const newOverrideResponse = await this.#authFetch("settings/addHostOverride", {
      method: "POST",
      body: JSON.stringify({ host: override }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
    const newOverride = (await newOverrideResponse.json()) as { result: string }

    if (!(newOverrideResponse.ok && newOverride.result === "saved"))
      return err(
        `failed to add override for '${override.domain}': (${newOverrideResponse.status}) [${newOverrideResponse.statusText}] ${JSON.stringify(newOverride)}`,
      )
  }

  public async restartUnbound(): Promise<Result<void>> {
    const restartUnboundResponse = await this.#authFetch("service/restart", {
      method: "POST",
    })
    const restartUnbound = (await restartUnboundResponse.json()) as { response: string }

    if (!(restartUnboundResponse.ok && restartUnbound.response === "OK"))
      return err(
        `failed to restart unbound: (${restartUnboundResponse.status}) [${restartUnboundResponse.statusText}] ${JSON.stringify(restartUnbound)}`,
      )
  }
}
