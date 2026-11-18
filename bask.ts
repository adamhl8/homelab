import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"

import { task } from "@adamhl8/bask"

export * from "@adamhl8/configs/bask"

export const plan = task(
  { desc: "Show what tsinfra would change on the given hosts", positionals: true },
  async ({ sh, positionals }) => {
    // Pass the exit code through because tsinfra exits 2 on drift, which isn't a task failure.
    const { exitCode } = await sh`tsinfra plan ${positionals}`.nothrow()
    process.exitCode = exitCode
  },
)

export const apply = task(
  { desc: "Apply tsinfra changes to the given hosts", positionals: true },
  async ({ sh, positionals }) => {
    await sh`tsinfra apply ${positionals}`
  },
)

export const tvBuild = task(
  {
    desc: "Build Free My TV for the living room TV",
    args: { install: { short: "i", desc: "Install it on the TV after the build" } },
  },
  async ({ sh, args }) => {
    await sh`bun tv/build.ts ${args.install ? "--install" : []}`
  },
)

// Read the global and the `-currentHost` defaults, because a toggle can write to either.
const DEFAULTS_READS = {
  defaults: ["defaults", "read"],
  "defaults-current-host": ["defaults", "-currentHost", "read"],
}

export const defaultsDiff = task(
  { desc: "Find which defaults key a macOS settings toggle maps to" },
  async ({ sh }) => {
    const dir = await mkdtemp(path.join(tmpdir(), "defaults-diff-"))
    const snapshot = async (folder: string) =>
      Promise.all(
        Object.entries(DEFAULTS_READS).map(async ([name, command]) =>
          Bun.write(path.join(dir, folder, name), await sh`${command}`.echo(false).text()),
        ),
      )

    try {
      await snapshot("before")
      // oxlint-disable-next-line no-alert -- Bun's `prompt` reads a line from the terminal
      prompt("Change a setting now, then press Enter.")
      await snapshot("after")
      // Use `nothrow` because `git diff --no-index` exits 1 when the files differ.
      await sh`git --no-pager diff --no-index before after`.cwd(dir).echo(false).nothrow()
    } finally {
      await rm(dir, { recursive: true })
    }
  },
)
