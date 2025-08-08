import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

export async function post(): Promise<Result> {
  const host = "unifi.lan"

  const unifiStatusResponse = await safeFetch("https://unifi.lan:8000/status", {
    tls: { rejectUnauthorized: false },
  })
  if (isErr(unifiStatusResponse)) return err("failed to get current version", unifiStatusResponse)
  const unifiStatus = (await unifiStatusResponse.json()) as { meta: { server_version: string } }
  const currentVersion = unifiStatus.meta.server_version

  const latestReleaseResponse = await safeFetch("https://community.svc.ui.com/releases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "query GetLatestRelease($tags: [String!], $limit: Int, $sortBy: ReleasesSortBy, $searchTerm: String) { releases(tags: $tags, limit: $limit, sortBy: $sortBy, searchTerm: $searchTerm) { items { title version } } }",
      variables: {
        limit: 1,
        sortBy: "LATEST",
        tags: ["unifi-network"],
        searchTerm: "UniFi Network Application",
      },
      operationName: "GetLatestRelease",
    }),
  })
  if (isErr(latestReleaseResponse)) return err("failed to get latest version", latestReleaseResponse)
  const latestRelease = (await latestReleaseResponse.json()) as {
    data: { releases: { items: { title: string; version: string }[] } }
  }
  const latestVersion = latestRelease.data.releases.items.find(
    (item) => item.title === "UniFi Network Application",
  )?.version

  if (currentVersion === latestVersion) {
    logger.info(`UniFi Network Application is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating UniFi Network Application from ${currentVersion} to ${latestVersion}...`)

  const commands = [
    `curl -fsSLo ~/unifi.deb 'https://dl.ui.com/unifi/${latestVersion}/unifi_sysvinit_all.deb'`,
    "sudo apt install -qq -y ~/unifi.deb && rm ~/unifi.deb",
  ]

  for (const command of commands) {
    // biome-ignore lint/nursery/noAwaitInLoop: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
