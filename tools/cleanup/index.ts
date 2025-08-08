import fs from "node:fs/promises"
import os from "node:os"
import process from "node:process"
import { $ } from "bun"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { resolvePath } from "~/tools/cleanup/utils.ts"

const PATTERNS_TO_REMOVE = [/^\.DS_Store/, /^\.localized/, /^\._.*/] as const

const SEARCH_PATHS = ["~", "/Volumes", "/Applications"] as const

const PATHS_TO_REMOVE = [
  "~/.android",
  "~/.bash_history",
  "~/bun_repl_history",
  "~/.cache",
  "~/.cocoapods",
  "~/.cups",
  "~/.dbclient",
  "~/.degit",
  "~/.embedded-postgres-go",
  "~/.expo",
  "~/.gradle",
  "~/.hawtjni",
  "~/.lemminx",
  "~/.lesshst",
  "~/.matplotlib",
  "~/.m2",
  "~/.node_repl_history",
  "~/.npm",
  "~/.pnpm-state",
  "~/.python_history",
  "~/.sonarlint",
  "~/.sts4",
  "~/.swiftpm",
  "~/.yarn",
  "~/.yarnrc",
  "~/Movies",
  "~/Music",
  "~/.viminfo",
  "~/.zsh_history",
] as const

async function removePaths() {
  const pathRemovePromises = PATHS_TO_REMOVE.map(async (path) => {
    const resolvedPath = resolvePath(path)
    const rmResult = await attempt(() => fs.rm(resolvedPath, { recursive: true }))

    if (isErr(rmResult) && !rmResult.message.startsWith("ENOENT"))
      console.error(`Failed to remove '${resolvedPath}': ${rmResult.message}`)
    else return

    console.info(`Removed '${resolvedPath}'`)
  })
  await Promise.all(pathRemovePromises)
}

async function handlePatterns() {
  for (const regex of PATTERNS_TO_REMOVE) {
    const pattern = regex.source
    console.info(`\nFinding files matching pattern '${pattern}'...`)
    const outputPromises = SEARCH_PATHS.map(async (searchPath) => {
      const output = await $`fd --unrestricted --absolute-path --type f ${pattern} ${searchPath}`.text()
      const cleanedOutput = output.trim().split("\n").filter(Boolean)
      return cleanedOutput
    })
    // biome-ignore lint/nursery/noAwaitInLoop: handle each pattern individually
    const matches = (await Promise.all(outputPromises)).flat()
    if (matches.length === 0) {
      console.info("No matches found")
      continue
    }

    console.info(`Found ${matches.length} files:`)
    console.info(matches.join("\n"))

    const response = prompt("\nRemove? [y/N]")
    if (!response || response.trim().toLowerCase() !== "y") continue

    const patternRemovePromises = matches.map(async (path) => {
      const resolvedPath = resolvePath(path)
      await fs.rm(resolvedPath, { force: true })
    })
    await Promise.all(patternRemovePromises)

    console.info(`Removed ${matches.length} files`)
  }
}

async function cleanup(): Promise<Result> {
  if (os.userInfo().uid !== 0) return err("cleanup must be run as root")

  console.info("Removing paths...")
  await removePaths()

  await handlePatterns()
}

async function main(): Promise<number> {
  const result = await cleanup()
  if (isErr(result)) {
    console.error(result.messageChain)
    return 1
  }
  return 0
}

process.exitCode = await main()
