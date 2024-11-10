import { existsSync } from "node:fs"
import { join, normalize } from "node:path"
import untildify from "untildify"

function resolveLocalPath(relativePath: string) {
  return join(getProjectRoot(), relativePath)
}

function normalizePath(path: string) {
  return normalize(untildify(path))
}

function getProjectRoot(): string {
  const cwd = process.cwd()

  const hasGit = existsSync(join(cwd, ".git"))
  const hasPackageJson = existsSync(join(cwd, "package.json"))

  if (!(hasGit || hasPackageJson)) {
    throw new Error(
      "Unable to determine project root. Please ensure you are running from the project root directory " +
        "(should contain .git folder or package.json)",
    )
  }

  return cwd
}

export { normalizePath, resolveLocalPath, getProjectRoot }
