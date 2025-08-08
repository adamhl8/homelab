import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

export async function post(): Promise<Result> {
  const host = "filebrowser.lan"

  const currentVersionResult = await runInstanceCommand(host, "filebrowser version", { quiet: true })
  if (isErr(currentVersionResult)) return err("failed to get current version", currentVersionResult)
  // File Browser v2.41.0/e5e1b6de
  const currentVersion = currentVersionResult.split(" ")[2]?.split("/")[0] ?? "UNKNOWN"

  const latestReleaseResponse = await safeFetch("https://api.github.com/repos/filebrowser/filebrowser/releases/latest")
  if (isErr(latestReleaseResponse)) return err("failed to get latest version", latestReleaseResponse)
  const latestRelease = (await latestReleaseResponse.json()) as { tag_name: string }
  const latestVersion = latestRelease.tag_name

  if (currentVersion === latestVersion) {
    logger.info(`File Browser is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating File Browser from ${currentVersion} to ${latestVersion}...`)

  const commands = [
    "curl -fsSLo ~/filebrowser.tar.gz 'https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz'",
    "tar -xzf ~/filebrowser.tar.gz -C ~/bin/ filebrowser",
    "rm ~/filebrowser.tar.gz",
    "chmod +x ~/bin/filebrowser",
    "sudo systemctl restart filebrowser",
  ]

  for (const command of commands) {
    // biome-ignore lint/nursery/noAwaitInLoop: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
