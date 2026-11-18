import os from "node:os"
import path from "node:path"

import { type } from "arktype"
import { $ } from "bun"

import { SECRETS } from "#hosts/lib/paths.ts"

const AGE_KEY = path.join(os.homedir(), ".config/sops/age/keys.txt")

const Credentials = type("Record<string, string>")
const SshKeys = type({ "[string]": { pri: "string", pub: "string" } })

// Cache the decrypted files because every `sops -d` is a separate decryption.
const decrypted = new Map<string, Promise<unknown>>()

const decrypt = async (file: string): Promise<unknown> => {
  if (!(await Bun.file(AGE_KEY).exists())) throw new Error(`no age identity at ${AGE_KEY}, run ./bootstrap.sh`)
  const output: unknown = await $`sops -d --output-type json ${path.join(SECRETS, file)}`
    .env({ ...process.env, SOPS_AGE_KEY_FILE: AGE_KEY })
    .quiet()
    .json()
  return output
}

/** Returns `key` from `secrets/credentials.yaml`, decrypted with SOPS on this machine. */
export const secret = async (key: string): Promise<string> => {
  const credentials = Credentials.assert(await decrypted.getOrInsertComputed("credentials.yaml", decrypt))
  const value = credentials[key]
  if (value === undefined) throw new Error(`no '${key}' in secrets/credentials.yaml`)
  return value
}

/** Returns the `name` keypair from `secrets/ssh.yaml`, decrypted with SOPS on this machine. */
export const sshKey = async (name: string): Promise<{ pri: string; pub: string }> => {
  const keys = SshKeys.assert(await decrypted.getOrInsertComputed("ssh.yaml", decrypt))
  const key = keys[name]
  if (key === undefined) throw new Error(`no '${name}' in secrets/ssh.yaml`)
  return key
}
