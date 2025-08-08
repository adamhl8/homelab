import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { err } from "ts-explicit-errors"

export class SopsClient {
  readonly #secretsFilePath: string

  public constructor(secretsFilePath: string) {
    this.#secretsFilePath = secretsFilePath
  }

  public async get(key: string): Promise<Result<string>> {
    const result = await $`sops -d --extract '["${key}"]' ${this.#secretsFilePath}`.nothrow().quiet()
    if (result.exitCode !== 0) return err(`failed to get value for '${key}': ${result.stderr.toString().trim()}`)
    return result.text()
  }
}
