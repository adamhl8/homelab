import { readdir } from "node:fs/promises"
import path from "node:path"

import type { FileMode, Host, LinkOptions } from "tsinfra"
import { PUBLIC_EXECUTABLE_MODE, PUBLIC_FILE_MODE } from "tsinfra"

import { HOSTS } from "#hosts/lib/paths.ts"

/** A source as its path under `hosts/`, or with the mode it should have. */
export type LinkSource = string | { source: string; mode: FileMode }

/**
 * Links each path on the host to its source under `hosts/`, so an app's edits show up in the repo. Sets each source's
 * mode, `PUBLIC_FILE_MODE` unless the entry or `targetAttributes` gives one.
 */
export const linkFiles = async (h: Host, files: Record<string, LinkSource>, options: LinkOptions = {}) => {
  const { targetAttributes, ...linkOptions } = options
  const defaultMode = targetAttributes?.mode ?? PUBLIC_FILE_MODE

  for (const [destination, entry] of Object.entries(files)) {
    const { source, mode } = typeof entry === "string" ? { source: entry, mode: defaultMode } : entry
    await h.link(destination, path.join(HOSTS, source), {
      ...linkOptions,
      targetAttributes: { ...targetAttributes, mode },
    })
  }
}

/** Returns each script in `hosts/files/bin`, mapped to its path in `~/bin`, as an executable. */
export const binScripts = async (): Promise<Record<string, LinkSource>> => {
  const scripts = await readdir(path.join(HOSTS, "files/bin"))
  // Skip hidden files so a stray `.DS_Store` never lands in `~/bin`.
  const visible = scripts.filter((script) => !script.startsWith("."))
  return Object.fromEntries(
    visible.map((script) => [`~/bin/${script}`, { source: `files/bin/${script}`, mode: PUBLIC_EXECUTABLE_MODE }]),
  )
}
