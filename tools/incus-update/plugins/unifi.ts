import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

// unifi-network-application-9419-debianubuntu
const SLUG_REGEX = /unifi-network-application-\d+-debianubuntu/

export async function post(): Promise<Result> {
  const host = "unifi.lan"

  const unifiStatusResponse = await safeFetch("https://unifi.lan:8000/status", {
    tls: { rejectUnauthorized: false },
  })
  if (isErr(unifiStatusResponse)) return err("failed to get current version", unifiStatusResponse)
  const unifiStatus = (await unifiStatusResponse.json()) as { meta: { server_version: string } }
  const currentVersion = unifiStatus.meta.server_version

  const unifiSoftwareDownloadsResponse = await safeFetch("https://download.svc.ui.com/v1/software-downloads")
  if (isErr(unifiSoftwareDownloadsResponse))
    return err("failed to get UniFi software downloads", unifiSoftwareDownloadsResponse)

  const { downloads } = (await unifiSoftwareDownloadsResponse.json()) as {
    downloads: { version: string; slug: string; file_path: string; date_published: string }[]
  }

  downloads.sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime())

  const latestUnifiNetworkApplication = downloads.find((download) => SLUG_REGEX.exec(download.slug))
  if (!latestUnifiNetworkApplication) return err("failed to find latest UniFi Network Application", undefined)

  const { version: latestVersion, file_path } = latestUnifiNetworkApplication

  if (currentVersion === latestVersion) {
    logger.info(`UniFi Network Application is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating UniFi Network Application from ${currentVersion} to ${latestVersion}...`)

  const commands = [`curl -fsSLo ~/unifi.deb '${file_path}'`, "sudo apt install -qq -y ~/unifi.deb && rm ~/unifi.deb"]

  for (const command of commands) {
    // biome-ignore lint/performance/noAwaitInLoops: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
