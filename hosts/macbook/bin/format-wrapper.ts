#!/usr/bin/env bun
/** biome-ignore-all lint/correctness/useHookAtTopLevel: not a react component */

import path from "node:path"
import process from "node:process"
import { $ } from "bun"

const [bufferPath = "", prettierConfigPath = ""] = process.argv.slice(2)
const stdin = await Bun.stdin.text()
const cwd = process.cwd()

type FormatterResult = {
  identifier: string
  stdout: string
  stderr: string
  exitCode: number
}
type Formatter = (input: string) => FormatterResult | Promise<FormatterResult>
type FormatterGroup = Formatter | Formatter[]

function getFormatterErrorString(result: FormatterResult): string | undefined {
  // if the output is empty, it's likely a formatter failed, printed nothing, but didn't exit with a non-zero status
  // regardless of the reason it's empty, we don't want to continue or else we'd replace the current buffer with nothing
  if (result.exitCode === 0 && result.stdout.trim().length > 0) return
  return `\n${result.identifier}: [exit status ${result.exitCode}] ${result.stderr || "format-wrapper: something went wrong, output is empty"}\n--------`
}

/**
 * Runs each {@link FormatterGroup} in order. If a `FormatterGroup` succeeds, no further `FormatterGroup`s are run and the result is written to stdout (and ultimately to the Zed buffer).
 *
 * In other words, subsequent `FormatterGroup`s are used as fallbacks.
 *
 * If the `FormatterGroup` is an array, _all_ of the `Formatter`s in the array must succeed for the `FormatterGroup` to succeed.
 * - The output of each `Formatter` is used as the input for the next `Formatter` in the array.
 * - This allows you to chain multiple formatters together and use the combined results.
 *
 * @param formatterGroups One or more {@link FormatterGroup}, which is either a single {@link Formatter} or an array of {@link Formatter}
 * @returns void
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: it's fine
async function useFormatters(...formatterGroups: FormatterGroup[]) {
  let errors = ""

  for (const formatterGroup of formatterGroups) {
    if (Array.isArray(formatterGroup)) {
      let currentInput = stdin
      let allSucceeded = true
      let finalResult: FormatterResult | undefined

      for (const formatter of formatterGroup) {
        // biome-ignore lint/performance/noAwaitInLoops: we need to wait for each formatter
        const result = await formatter(currentInput)
        const errorString = getFormatterErrorString(result)
        if (errorString) {
          errors += errorString
          allSucceeded = false
          break
        }

        // use output as input for next formatter
        currentInput = result.stdout
        finalResult = result
      }

      if (allSucceeded && finalResult) {
        process.stdout.write(`${finalResult.stdout}\n`)
        return
      }
    } else {
      const result = await formatterGroup(stdin)
      const errorString = getFormatterErrorString(result)
      if (errorString) {
        errors += errorString
        continue
      }

      process.stdout.write(`${result.stdout}\n`)
      return
    }
  }

  // if we got here, none of the formatters succeeded
  if (errors) process.stderr.write(`\n--------${errors}`)
  process.exitCode = 1
}

async function runFormatterCmd(cmd: string, input: string) {
  const { stdout, stderr, exitCode } = await $`echo ${input} | ${{ raw: cmd }}`.quiet().nothrow()
  return { stdout: stdout.toString().trim(), stderr: stderr.toString().trim(), exitCode }
}

const biome: Formatter = async (input) => {
  const biomeProjectCmd = `${cwd}/node_modules/.bin/biome`
  const identifier = `biome (${biomeProjectCmd})`
  const result: FormatterResult = {
    identifier,
    stdout: "",
    stderr: "",
    exitCode: 1,
  }

  const biomeBinaryExists = await Bun.file(biomeProjectCmd).exists()
  if (!biomeBinaryExists) {
    result.stderr = "skipped, biome binary not found"
    return result
  }

  const biomeConfigJsonExists = await Bun.file(`${cwd}/biome.json`).exists()
  const biomeConfigJsoncExists = await Bun.file(`${cwd}/biome.jsonc`).exists()
  if (!(biomeConfigJsonExists || biomeConfigJsoncExists)) {
    result.stderr = "skipped, no biome config found"
    return result
  }

  const { stdout, stderr, exitCode } = await runFormatterCmd(
    `"${biomeProjectCmd}" check --stdin-file-path="${bufferPath}" --write`,
    input,
  )

  result.stdout = stdout
  result.stderr = stderr
  result.exitCode = exitCode
  return result
}

const projectPrettier: Formatter = async (input) => {
  const prettierProjectCmd = `${cwd}/node_modules/.bin/prettier`
  const identifier = `prettier (${prettierProjectCmd})`
  const result: FormatterResult = {
    identifier,
    stdout: "",
    stderr: "",
    exitCode: 1,
  }

  const prettierBinaryExists = await Bun.file(prettierProjectCmd).exists()
  if (!prettierBinaryExists) {
    result.stderr = "skipped, prettier binary not found"
    return result
  }

  // if we don't give --find-config-path an argument, it won't check the cwd
  const prettierProjectConfig = (await $`prettier --find-config-path ' '`.quiet().nothrow().text()).trim()
  // if prettier doesn't find a config, the string will be empty
  if (!prettierProjectConfig) {
    result.stderr = "skipped, no prettier config found"
    return result
  }

  // prettier will look outside the cwd for a config, so the project config must exist within the cwd if we're going to use it (i.e. don't use the config if it starts with '../')
  if (prettierProjectConfig.startsWith("../")) {
    result.stderr = `skipped, the resolved config is outside the cwd (${prettierProjectConfig})`
    return result
  }

  const { stdout, stderr, exitCode } = await runFormatterCmd(
    `"${prettierProjectCmd}" --stdin-filepath "${bufferPath}"`,
    input,
  )

  result.stdout = stdout
  result.stderr = stderr
  result.exitCode = exitCode
  return result
}

const prettier: Formatter = async (input) => {
  const prettierCmd = Bun.which("prettier")
  const identifier = `prettier (${prettierCmd})`

  const { stdout, stderr, exitCode } = await runFormatterCmd(
    `"${prettierCmd}" --stdin-filepath "${bufferPath}" --config "${prettierConfigPath}"`,
    input,
  )

  return {
    identifier,
    stdout,
    stderr,
    exitCode,
  }
}

const fileExtension = path.extname(bufferPath)

if (fileExtension === ".astro") await useFormatters([projectPrettier, biome], prettier)
else await useFormatters(biome, projectPrettier, prettier)
