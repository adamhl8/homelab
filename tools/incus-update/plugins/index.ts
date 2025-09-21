import type { Result } from "ts-explicit-errors"

import * as backrest from "~/tools/incus-update/plugins/backrest.ts"
import * as caddy from "~/tools/incus-update/plugins/caddy.ts"
import * as filebrowser from "~/tools/incus-update/plugins/filebrowser.ts"
import * as rybbit from "~/tools/incus-update/plugins/rybbit.ts"
import * as scrutiny from "~/tools/incus-update/plugins/scrutiny.ts"
import * as unifi from "~/tools/incus-update/plugins/unifi.ts"

interface PluginModule {
  pre?: () => Promise<Result>
  post?: () => Promise<Result>
}

export const plugins: Record<string, PluginModule> = {
  backrest,
  caddy,
  filebrowser,
  rybbit,
  scrutiny,
  unifi,
}
