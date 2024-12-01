import { $, type Shell, type ShellExpression } from "bun"

interface BunShellOptions {
  cwd?: string
  env?: Record<string, string | undefined>
  quiet?: boolean
}

/**
 * This is a wrapper around Bun shell to make it easier to create new instances.
 */
class BunShell {
  #shell: Shell
  #cwd = ""
  #env: Record<string, string | undefined> = {}
  #quiet = false

  constructor(options?: BunShellOptions) {
    const { cwd, env, quiet } = options ?? {}

    this.#shell = new $.Shell()
    this.#shell.throws(true)

    this.cwd = cwd ?? process.cwd()
    this.env = env ?? Bun.env
    this.quiet = quiet ?? false
  }

  $(strings: TemplateStringsArray, ...expressions: ShellExpression[]) {
    if (this.quiet) return this.#shell(strings, ...expressions).quiet()
    return this.#shell(strings, ...expressions)
  }

  get cwd() {
    return this.#cwd
  }

  set cwd(path: string) {
    this.#shell.cwd(path)
    this.#cwd = path
  }

  get env() {
    return this.#env
  }

  set env(env: Record<string, string | undefined>) {
    this.#shell.env(env)
    this.#env = env
  }

  get quiet() {
    return this.#quiet
  }

  set quiet(quiet: boolean) {
    this.#quiet = quiet
  }
}

export { BunShell }
