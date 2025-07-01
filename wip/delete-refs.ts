#!/usr/bin/env bun

// bun build --compile --outfile=delete-refs --sourcemap=inline --minify ./scripts/delete-refs.ts && cp delete-refs ~/bin/delete-refs

import process from "node:process"
import { intro, isCancel, multiselect, outro, spinner } from "@clack/prompts"
import type { ShellError, ShellOutput } from "bun"
import { $ } from "bun"

async function deleteRemoteRefs() {
  intro("Delete Remote Refs")
  const s = spinner()
  s.start("Fetching refs...")

  const output = await $`git ls-remote --refs -q`.quiet().text()
  const lines = output.split("\n")
  const refs = lines
    .map((line) => line.split("\t")[1])
    .filter((ref): ref is string => !!ref)
    .filter((ref) => !ref.endsWith("/main"))

  s.stop()

  if (!refs.length) {
    outro("Did not find any additional refs on remote")
    process.exit(0)
  }

  const selectedRefs = await multiselect({
    message: "Select refs to delete on the remote",
    options: refs.map((ref) => {
      // a ref looks like this: refs/heads/feature/123-my-feature
      const parts = ref.split("/")
      const refType = parts[1]
      const refName = parts.slice(2).join("/")
      if (!refType) throw new Error(`Failed to parse refType from: ${ref}`)
      if (!refName) throw new Error(`Failed to parse refName from: ${ref}`)

      const refTypeString = refType === "heads" ? "branch" : refType === "tags" ? "tag" : refType

      return { value: ref, label: `${refTypeString}: ${refName}` }
    }),
  })

  if (isCancel(selectedRefs)) {
    outro("Exiting...")
    process.exit(0)
  }

  const refsToDelete = selectedRefs.filter((ref) => typeof ref === "string")

  const deletePromises = refsToDelete.map(async (ref) => {
    try {
      await $`git push --no-verify --delete origin ${ref}`.quiet()
      console.info(`Deleted ref: ${ref}`)
    } catch (error) {
      console.error(`An error occurred while deleting ref: ${ref}`)
      logError(error)
    }
  })

  await Promise.all(deletePromises)

  outro("Done!")
}

await deleteRemoteRefs()

function isShellError(error: unknown): error is ShellError {
  return typeof error === "object" && error !== null && "stderr" in error
}

function logError(error: unknown) {
  if (!(error instanceof Error)) {
    console.error("An unexpected error occurred:", error)
    return
  }

  let message = ""
  if (isShellError(error)) message = shellBuffersToString(error)
  else message = error.message

  console.warn(message || "error message was blank")
}

function shellBuffersToString(shellResult: ShellOutput | ShellError) {
  return mapAndJoinLines([shellResult.stdout, shellResult.stderr], (buffer) => buffer.toString().trim())
}

/**
 * Takes an array of items and a map function that should convert each item to a string.
 * It then filters out falsy values and joins the result with newlines.
 *
 * @param items - The array of items to map.
 * @param mapFn - A function that maps an item to a string.
 * @returns The mapped and joined string.
 */
function mapAndJoinLines<T>(items: T[], mapFn: (item: T) => string): string {
  return items.map(mapFn).filter(Boolean).join("\n")
}
