import type { Result } from "ts-explicit-errors"

import * as backrest from "./backrest.ts"
import * as caddy from "./caddy.ts"
import * as filebrowser from "./filebrowser.ts"
import * as rybbit from "./rybbit.ts"
import * as scrutiny from "./scrutiny.ts"
import * as unifi from "./unifi.ts"

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
