import type { Result } from "ts-explicit-errors"
import { err } from "ts-explicit-errors"

interface IncusApiResponse<T> {
  status: string
  metadata: T
}

interface IncusInstance {
  name: string
  profiles: string[]
  status: string
}

export class IncusClient {
  readonly #baseUrl: string

  public constructor(baseUrl: string) {
    this.#baseUrl = baseUrl
  }

  public async getInstances(): Promise<Result<string[]>> {
    const response = await fetch(`${this.#baseUrl}/1.0/instances`)
    const data = (await response.json()) as IncusApiResponse<string[]>

    if (!response.ok || data.status !== "Success") {
      return err(
        `failed to get instances: (${response.status}) [${response.statusText}] ${JSON.stringify(data)}`,
        undefined,
      )
    }

    return data.metadata.map((instancePath) => instancePath.split("/").pop() ?? "").filter(Boolean)
  }

  public async getInstance(name: string): Promise<Result<IncusInstance>> {
    const response = await fetch(`${this.#baseUrl}/1.0/instances/${name}`)
    const data = (await response.json()) as IncusApiResponse<IncusInstance>

    if (!response.ok || data.status !== "Success") {
      return err(
        `failed to get instance '${name}': (${response.status}) [${response.statusText}] ${JSON.stringify(data)}`,
        undefined,
      )
    }

    return {
      name: data.metadata.name,
      profiles: data.metadata.profiles,
      status: data.metadata.status,
    }
  }
}
