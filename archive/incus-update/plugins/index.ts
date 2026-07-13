import type { Result } from "ts-explicit-errors"

import { post as backrestPost } from "#archive/incus-update/plugins/backrest.ts"
import { post as caddyPost } from "#archive/incus-update/plugins/caddy.ts"
import { post as filebrowserPost } from "#archive/incus-update/plugins/filebrowser.ts"
import { pre as rybbitPre } from "#archive/incus-update/plugins/rybbit.ts"
import { post as scrutinyPost } from "#archive/incus-update/plugins/scrutiny.ts"

interface PluginModule {
  pre?: () => Promise<Result>
  post?: () => Promise<Result>
}

export const plugins: Record<string, PluginModule> = {
  backrest: { post: backrestPost },
  caddy: { post: caddyPost },
  filebrowser: { post: filebrowserPost },
  rybbit: { pre: rybbitPre },
  scrutiny: { post: scrutinyPost },
}
