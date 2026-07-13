#!/usr/bin/env bun
import { Buffer } from "node:buffer"
import path from "node:path"
import process from "node:process"

import bun, { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

const PORT = 8000
const PRESEED_ROUTE = "/preseed.cfg"

const METAL_DIR = import.meta.dir
const REPO_DIR = path.resolve(METAL_DIR, "..")
const PRESEED_PATH = path.join(METAL_DIR, "preseed.cfg")

const NETCFG_VALUES = {
  INTERFACE: "enp6s0",
  HOSTNAME: "incus",
  DOMAIN: "lan",
} as const

const sops = async (file: string, extractPath: string): Promise<Result<string>> => {
  const secret = await attempt(async () => $`sops -d --extract ${extractPath} ${path.join(REPO_DIR, file)}`.text())
  if (isErr(secret)) return err(`failed to decrypt '${extractPath}' from '${file}'`, secret)
  return secret.trim()
}

const hashPassword = async (password: string): Promise<Result<string>> => {
  const hash = await attempt(async () => $`openssl passwd -6 -stdin < ${Buffer.from(password)}`.text())
  if (isErr(hash)) return err("failed to hash the console password", hash)
  return hash.trim()
}

/** Everything substituted into `preseed.cfg` */
const getTemplateValues = async () => {
  const sshPubkey = await sops("configs/ssh.yaml", '["adam-macbook"]["pub"]')
  if (isErr(sshPubkey)) return sshPubkey

  const password = await sops("configs/secrets.yaml", '["homelab_password"]')
  if (isErr(password)) return password

  const passwordCrypt = await hashPassword(password)
  if (isErr(passwordCrypt)) return passwordCrypt

  return {
    TIMEZONE: "America/Chicago",
    USERNAME: "adam",
    FULLNAME: "Adam",
    SSH_PUBKEY: sshPubkey,
    PASSWORD_CRYPT: passwordCrypt,
  } as const
}

const renderPreseed = async (templateValues: Record<string, string>): Promise<Result<string>> => {
  const template = await attempt(async () => bun.file(PRESEED_PATH).text())
  if (isErr(template)) return err(`failed to read '${PRESEED_PATH}'`, template)

  const templateValueNamesSet = new Set(Object.keys(templateValues))

  const body = template
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n")
  const templateVarNames = body.matchAll(/\{\{(?<varname>.+?)\}\}/gv).map((match) => match.groups?.["varname"])
  const templateVarNamesSet = new Set(templateVarNames)

  const extraTemplateValues = templateValueNamesSet.difference(templateVarNamesSet)
  const extraTemplateVars = templateVarNamesSet.difference(templateValueNamesSet)

  if (extraTemplateVars.size > 0) {
    return err(
      `the following template vars are not being substituted:\n${[...extraTemplateVars].join("\n")}`,
      undefined,
    )
  }

  if (extraTemplateValues.size > 0)
    return err(`the following template values are unused:\n${[...extraTemplateValues].join("\n")}`, undefined)

  let preseed = template
  for (const [key, value] of Object.entries(templateValues)) preseed = preseed.replaceAll(`{{${key}}}`, value)

  return preseed
}

/**
 * The address the installer will reach us on. Connecting a UDP socket sends no packets, so this is just a routing table
 * lookup: it binds to our address on whichever interface routes to the host.
 */
const getLanIp = async (): Promise<Result<string>> => {
  const HOST_IP = "10.8.8.2"
  const socket = await attempt(async () => bun.udpSocket({ connect: { hostname: HOST_IP, port: 80 } }))
  if (isErr(socket)) return err("failed to determine which address to serve on", socket)

  const { address } = socket.address
  socket.close()

  return address
}

const serve = async (): Promise<Result> => {
  const templateValues = await getTemplateValues()
  if (isErr(templateValues)) return err("failed to gather the host values", templateValues)

  const preseed = await renderPreseed(templateValues)
  if (isErr(preseed)) return err("failed to render the preseed", preseed)

  const lanIp = await getLanIp()
  if (isErr(lanIp)) return lanIp

  const url = `http://${lanIp}:${PORT}${PRESEED_ROUTE}`

  const server = attempt(() =>
    bun.serve({
      port: PORT,
      routes: {
        [PRESEED_ROUTE]: (request, bunServer) => {
          console.info(`  --> served preseed to ${bunServer.requestIP(request)?.address ?? "unknown"}`)
          return new Response(preseed, { headers: { "content-type": "text/plain" } })
        },
      },
      fetch: () => new Response("not found", { status: 404 }),
    }),
  )
  if (isErr(server)) return err(`failed to listen on port ${PORT}`, server)

  console.info(`
Boot the Debian netinst, press \`e\` at the GRUB menu, and append this to
the line starting \`linux\`:

    auto=true priority=critical interface=${NETCFG_VALUES.INTERFACE} hostname=${NETCFG_VALUES.HOSTNAME} domain=${NETCFG_VALUES.DOMAIN} url=${url}

Ctrl-X to boot.

Serving ${url}
`)
}

const main = async (): Promise<number> => {
  const result = await serve()
  if (isErr(result)) {
    console.error(result.messageChain)
    return 1
  }
  return 0
}

process.exitCode = await main()
