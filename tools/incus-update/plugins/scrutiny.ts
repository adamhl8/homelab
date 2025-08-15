import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

export async function post(): Promise<Result> {
  const host = "incus.lan"

  logger.info("Updating scrutiny-collector on Incus host...")

  const currentVersionResult = await runInstanceCommand(host, "scrutiny-collector --version 2>/dev/null", {
    quiet: true,
  })
  if (isErr(currentVersionResult)) return err("failed to get current version", currentVersionResult)
  const currentVersion = `v${currentVersionResult.split(" ")[2] ?? "UNKNOWN"}`

  const latestReleaseResponse = await safeFetch("https://api.github.com/repos/AnalogJ/scrutiny/releases/latest")
  if (isErr(latestReleaseResponse)) return err("failed to get latest version", latestReleaseResponse)
  const latestRelease = (await latestReleaseResponse.json()) as { tag_name: string }
  const latestVersion = latestRelease.tag_name

  if (currentVersion === latestVersion) {
    logger.info(`scrutiny-collector is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating scrutiny-collector from ${currentVersion} to ${latestVersion}...`)

  const commands = [
    "curl -fsSLo ~/bin/scrutiny-collector https://github.com/analogj/scrutiny/releases/latest/download/scrutiny-collector-metrics-linux-amd64",
    "chmod +x ~/bin/scrutiny-collector",
  ]

  for (const command of commands) {
    // biome-ignore lint/performance/noAwaitInLoops: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
