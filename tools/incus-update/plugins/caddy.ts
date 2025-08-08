import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand, safeFetch } from "~/tools/incus-update/utils.ts"

export async function post(): Promise<Result> {
  const host = "caddy.lan"

  const currentVersionResult = await runInstanceCommand(host, "caddy version", { quiet: true })
  if (isErr(currentVersionResult)) return err("failed to get current version", currentVersionResult)
  const currentVersion = currentVersionResult.split(" ")[0] ?? "UNKNOWN"

  const latestReleaseResponse = await safeFetch("https://api.github.com/repos/caddyserver/caddy/releases/latest")
  if (isErr(latestReleaseResponse)) return err("failed to get latest version", latestReleaseResponse)
  const latestRelease = (await latestReleaseResponse.json()) as { tag_name: string }
  const latestVersion = latestRelease.tag_name

  if (currentVersion === latestVersion) {
    logger.info(`caddy is up to date (${currentVersion})`)
    return
  }

  logger.info(`Updating caddy from ${currentVersion} to ${latestVersion}...`)

  const commands = [
    "go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest > /dev/null",
    "xcaddy build \
      --with github.com/greenpau/caddy-security \
      --with github.com/caddy-dns/route53 \
      --replace github.com/libdns/route53=github.com/libdns/route53@master \
      --output ./caddy > /dev/null",
    "chmod +x caddy",
    "sudo dpkg-divert --divert /usr/bin/caddy.default --rename /usr/bin/caddy",
    "sudo mv ./caddy /usr/bin/caddy.custom",
    "sudo update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.default 10",
    "sudo update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.custom 50",
    "sudo systemctl daemon-reload",
    "sudo systemctl restart caddy",
  ]

  for (const command of commands) {
    // biome-ignore lint/nursery/noAwaitInLoop: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
