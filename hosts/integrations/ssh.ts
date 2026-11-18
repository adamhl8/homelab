import { PRIVATE_DIRECTORY_MODE, PRIVATE_FILE_MODE, PUBLIC_FILE_MODE } from "tsinfra"
import type { Host } from "tsinfra"

import { sshKey } from "#hosts/lib/sops.ts"

// Add a trailing newline because OpenSSH rejects a private key without one.
const withNewline = (content: string): string => (content.endsWith("\n") ? content : `${content}\n`)

/** Writes each keypair in `keys` from `secrets/ssh.yaml` into `~/.ssh`, keyed by file name. */
export const sshKeys = async (h: Host, keys: Record<string, string>) => {
  await h.dir("~/.ssh", { mode: PRIVATE_DIRECTORY_MODE })

  for (const [file, name] of Object.entries(keys)) {
    const { pri, pub } = await sshKey(name)
    await h.file(`~/.ssh/${file}`, withNewline(pri), { secret: true, mode: PRIVATE_FILE_MODE })
    await h.file(`~/.ssh/${file}.pub`, withNewline(pub), { mode: PUBLIC_FILE_MODE })
  }
}
