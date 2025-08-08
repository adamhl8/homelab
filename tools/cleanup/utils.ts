import os from "node:os"
import path from "node:path"

const TILDE_REGEX = /^~(?=$|\/|\\)/
const HOME_DIR = os.homedir()

function untildify(pathWithTilde: string) {
  return HOME_DIR ? pathWithTilde.replace(TILDE_REGEX, HOME_DIR) : pathWithTilde
}

export function resolvePath(pathToResolve: string) {
  let resolvedPath = pathToResolve.trim()
  resolvedPath = untildify(resolvedPath)
  resolvedPath = path.resolve(resolvedPath)
  return resolvedPath
}
