import type { Result } from "ts-explicit-errors"
import { isErr } from "ts-explicit-errors"

import { logger, runInstanceCommand } from "~/tools/incus-update/utils.ts"

export async function pre(): Promise<Result> {
  const host = "rybbit.lan"

  logger.info("Cloning Rybbit repository...")

  const commands = [
    "docker compose down",
    "rm -rf rybbit-repo",
    "git clone --depth=1 https://github.com/rybbit-io/rybbit.git rybbit-repo",
  ]

  for (const command of commands) {
    // biome-ignore lint/performance/noAwaitInLoops: need to run commands in order
    const result = await runInstanceCommand(host, command)
    if (isErr(result)) return result
  }
}
