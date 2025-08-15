import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

export async function post(): Promise<Result> {
  const host = "backrest.lan"

  const currentVersionResult = await runInstanceCommand(host, "cat ~/.backrest/.version", { quiet: true })
  if (isErr(currentVersionResult)) return err("failed to get current version", currentVersionResult)
  const currentVersion = currentVersionResult.trim()

  const latestReleaseResponse = await safeFetch("https://api.github.com/repos/garethgeorge/backrest/releases/latest")
  if (isErr(latestReleaseResponse)) return err("failed to get latest version", latestReleaseResponse)
  const latestRelease = (await latestReleaseResponse.json()) as { tag_name: string }
  const latestVersion = latestRelease.tag_name

  if (currentVersion === latestVersion) {
    logger.info(`Backrest is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating Backrest from ${currentVersion} to ${latestVersion}...`)

  const commands = [
    "curl -fsSLo backrest.tar.gz https://github.com/garethgeorge/backrest/releases/latest/download/backrest_Linux_x86_64.tar.gz",
    "tar -xzf backrest.tar.gz -C ~/bin/ backrest",
    "rm -f backrest.tar.gz",
    "chmod +x ~/bin/backrest",
    "sudo systemctl restart backrest",
    `echo '${latestVersion}' > ~/.backrest/.version`,
  ]

  for (const command of commands) {
    // biome-ignore lint/performance/noAwaitInLoops: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
