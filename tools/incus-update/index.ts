import process from "node:process"
import { parseArgs } from "node:util"
import type { Result } from "ts-explicit-errors"
import { err, isErr } from "ts-explicit-errors"

import { IncusClient } from "~/tools/incus-update/incus.ts"
import { plugins } from "~/tools/incus-update/plugins/index.ts"
import { logger, runInstanceCommand } from "~/tools/incus-update/utils.ts"

const INCUS_BASE_URL = "https://incus.adamhl.dev"

interface UpdateInstanceOptions {
  hasDockerProfile?: boolean
  dockerPrune?: boolean
  verbose?: boolean
}

async function updateInstance(instanceName: string, options?: UpdateInstanceOptions): Promise<Result> {
  const quiet = !options?.verbose

  console.log()
  logger.info(`Updating '${instanceName}'`)
  const host = `${instanceName}.lan`

  const instancePlugin = plugins[instanceName]

  if (instancePlugin?.pre) {
    logger.info("Running pre-update hook...")
    const pluginPreResult = await instancePlugin.pre()
    if (isErr(pluginPreResult)) return err(`failed to run pre-update hook for '${instanceName}'`, pluginPreResult)
  }
  logger.info("Updating packages...")
  const aptUpdateResult = await runInstanceCommand(
    host,
    'export DEBIAN_FRONTEND=noninteractive; \
    sudo --preserve-env=DEBIAN_FRONTEND apt -q -y update && \
    sudo --preserve-env=DEBIAN_FRONTEND apt -q -y -o "Dpkg::Options::=--force-confdef" -o "Dpkg::Options::=--force-confold" full-upgrade && \
    sudo --preserve-env=DEBIAN_FRONTEND apt -q -y autoremove',
    { quiet },
  )

  if (isErr(aptUpdateResult)) return err(`failed to update packages on '${instanceName}'`, aptUpdateResult)

  if (options?.hasDockerProfile) {
    logger.info("Updating docker containers...")

    const dockerUpdateResult = await runInstanceCommand(host, "docker compose pull && docker compose up -d --build", {
      quiet,
    })
    if (isErr(dockerUpdateResult))
      return err(`failed to update docker containers on '${instanceName}'`, dockerUpdateResult)

    if (options.dockerPrune) {
      logger.info("Pruning docker...")
      const dockerPruneResult = await runInstanceCommand(
        host,
        "docker system prune -a --volumes -f && docker volume prune -a -f",
        { quiet },
      )
      if (isErr(dockerPruneResult)) return err(`failed to prune docker on '${instanceName}'`, dockerPruneResult)
    }
  }

  if (instancePlugin?.post) {
    logger.info("Running post-update hook...")
    const pluginPostResult = await instancePlugin.post()
    if (isErr(pluginPostResult)) return err(`failed to run post-update hook for '${instanceName}'`, pluginPostResult)
  }
}

const EXCLUDED_INSTANCES = ["opnsense"]

async function incusUpdate(): Promise<Result> {
  const { values: options } = parseArgs({
    args: process.argv.slice(2),
    options: {
      prune: {
        type: "boolean",
        default: false,
        short: "p",
      },
      verbose: {
        type: "boolean",
        default: false,
        short: "v",
      },
    },
  })

  const incusClient = new IncusClient(INCUS_BASE_URL)

  const instanceNames = await incusClient.getInstances()
  if (isErr(instanceNames)) return err("failed to get instances", instanceNames)

  logger.info(`Found ${instanceNames.length} instances`)

  const failedInstances: string[] = []
  for (const instanceName of instanceNames) {
    if (EXCLUDED_INSTANCES.includes(instanceName)) continue

    // biome-ignore lint/performance/noAwaitInLoops: handle one instance at a time
    const instance = await incusClient.getInstance(instanceName)
    if (isErr(instance)) return err(`failed to get instance details for '${instanceName}'`, instance)

    if (instance.status !== "Running") {
      logger.warn(`'${instanceName}' is not running, skipping`)
      failedInstances.push(instanceName)
      continue
    }

    const hasDockerProfile = instance.profiles.includes("docker")

    const updateResult = await updateInstance(instanceName, {
      hasDockerProfile,
      dockerPrune: options.prune,
      verbose: options.verbose,
    })
    if (isErr(updateResult)) {
      logger.error(`failed to update instance '${instanceName}': ${updateResult.messageChain}`)
      failedInstances.push(instanceName)
    } else logger.info(`✓ Successfully updated '${instanceName}'`)
  }

  const incusUpdateResult = await updateInstance("incus", {
    verbose: options.verbose,
  })
  if (isErr(incusUpdateResult)) logger.error(`failed to update Incus host: ${incusUpdateResult.messageChain}`)
  else logger.info("✓ Successfully updated Incus host")

  console.log()
  if (failedInstances.length > 0)
    logger.error(`The following instances failed to update: ${failedInstances.join(", ")}`)
  else logger.info("Done")
}

async function main(): Promise<number> {
  const result = await incusUpdate()
  if (isErr(result)) {
    logger.error(result.messageChain)
    return 1
  }
  return 0
}

process.exitCode = await main()
