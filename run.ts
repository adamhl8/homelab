#!/usr/bin/env bun

import { $, Glob, which } from "bun"
import fs from "node:fs/promises"
import path from "node:path"
import { reboot } from "./lib/prompts.ts"

type Module = Record<string, () => Promise<void>>

const homelabRoot = import.meta.dir
const nodeName = process.argv[2] ?? ""

async function main() {
  if (!nodeName) throw new Error("No node name provided.")

  const nodeImportPath = `./nodes/${nodeName}.ts`

  if (which("sudo")) await $`sudo -v`

  const nodeExports = (await import(nodeImportPath)) as Module
  const steps = Object.values(nodeExports)
  const lastStep = steps.at(-1)

  for (const step of steps) {
    const stepCompletionFilePath = path.join(homelabRoot, `${step.name}.completed`)
    const stepCompletionFile = Bun.file(stepCompletionFilePath)
    const isStepComplete = await stepCompletionFile.exists()

    if (isStepComplete) continue

    await step()

    await Bun.write(stepCompletionFile, "")
    console.log(`${step.name} complete.`)

    if (step === lastStep) await removeStepCompletionFiles()

    if (!(await reboot())) process.exit(0)
  }
}

async function removeStepCompletionFiles() {
  console.log(`Finished running ${nodeName}.`)
  const stepCompletionFiles = new Glob("*.completed").scan({
    cwd: homelabRoot,
    absolute: true,
  })
  for await (const stepCompletionFile of stepCompletionFiles) {
    await fs.unlink(stepCompletionFile)
  }
}

await main()
