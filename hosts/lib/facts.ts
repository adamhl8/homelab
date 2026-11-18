import type { Host } from "tsinfra"

export type Platform = "macos" | "linux"
type Arch = "amd64" | "arm64"

interface Distro {
  /** The distro's `ID` from `/etc/os-release`, like `debian` or `ubuntu`. */
  id: string
  /** The release's `VERSION_CODENAME`, like `trixie`. It's undefined on a rolling distro, which has none. */
  codename: string | undefined
}

const PLATFORMS: Record<string, Platform> = { Darwin: "macos", Linux: "linux" }
// Map both spellings because macOS reports `arm64`, Linux reports `aarch64`, and both report `x86_64`.
const ARCHES: Record<string, Arch> = { x86_64: "amd64", amd64: "amd64", aarch64: "arm64", arm64: "arm64" }

// Read each fact once per host because several integrations ask, and no step changes it.
const perHost = <T>(read: (h: Host) => Promise<T>) => {
  const cache = new WeakMap<Host, Promise<T>>()
  return async (h: Host): Promise<T> => {
    const cached = cache.get(h)
    if (cached) return cached
    const fact = read(h)
    cache.set(h, fact)
    return fact
  }
}

/** Returns whether the host runs macOS or Linux, and throws on anything else. */
export const hostPlatform = perHost(async (h) => {
  const kernel = await h.read("uname -s")
  const platform = PLATFORMS[kernel]
  if (!platform) throw new Error(`unsupported platform: ${kernel}`)
  return platform
})

/**
 * Returns the host's CPU architecture, named the way Debian and most release assets name it.
 *
 * @public
 */
export const hostArch = perHost(async (h) => {
  const machine = await h.read("uname -m")
  const arch = ARCHES[machine]
  if (!arch) throw new Error(`unsupported architecture: ${machine}`)
  return arch
})

/**
 * Returns a Linux host's distro and release codename, and throws on macOS, which has no `/etc/os-release`.
 *
 * @public
 */
export const hostDistro = perHost(async (h): Promise<Distro> => {
  if ((await hostPlatform(h)) !== "linux") throw new Error("only a Linux host has a distro")
  // Source the file because its values can be quoted, like `ID="rhel"`.
  const output = await h.read(`. /etc/os-release && printf '%s\\n%s' "$ID" "$VERSION_CODENAME"`)
  const [id = "", codename = ""] = output.split("\n")
  return { id, codename: codename === "" ? undefined : codename }
})
