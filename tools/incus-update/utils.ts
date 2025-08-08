import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

interface ShellOptions {
  quiet?: boolean
}

export async function sh(command: string, options?: ShellOptions): Promise<Result<string>> {
  const shellCommand = $`${{ raw: command }}`.nothrow()
  if (options?.quiet) shellCommand.quiet()

  const result = await shellCommand
  const output = [result.stdout, result.stderr].map((text) => text.toString("utf-8").trim()).join("\n")
  if (result.exitCode !== 0) return err(`command '${command}' failed with exit code ${result.exitCode}: ${output}`)
  return output.trim()
}

export async function runInstanceCommand(
  host: string,
  command: string,
  options?: ShellOptions,
): Promise<Result<string>> {
  // The command might contain variables that need to be interpolated.
  // Note that there are three shells involved here:
  // 1. The local shell which executes the `ssh` command
  // 2. The remote shell which executes the `bash -li -c` command
  // 3. The final shell created by the above which executes the command
  // We want variables to be interpolated in the final shell
  //
  // Due to issues with either JS or Bun shell, wrapping the command in single quotes is tricky
  // We want to do this: ssh -o LogLevel=ERROR -t ${host} 'bash -li -c '${command}''
  // Note how both the `bash -li -c` and the final command are wrapped in single quotes. However, this doesn't work for whatever reason
  //
  // To help explain the following, we can add some spaces to make it clear where each quoted string starts and ends
  // 'bash -li -c ' "'" '${command}' "'"
  return await sh(`ssh -o LogLevel=ERROR -t ${host} 'bash -li -c '"'"'${command}'"'"`, options)
}

export async function safeFetch(url: string, init?: BunFetchRequestInit): Promise<Result<Response>> {
  const response = await attempt(() => fetch(url, init))
  if (isErr(response)) return err(`failed to fetch '${url}'`, response)
  if (!response.ok)
    return err(`failed to fetch '${url}': (${response.status}) [${response.statusText}] ${await response.text()}`)

  return response
}

const loggerPrefix = "[incus-update]"
export const logger = {
  info: (message: string) => console.info(`${loggerPrefix} ${message}`),
  warn: (message: string) => console.warn(`${loggerPrefix} ${message}`),
  error: (message: string) => console.error(`${loggerPrefix} ${message}`),
}
