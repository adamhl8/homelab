import path from "node:path"

export const REPO = path.resolve(import.meta.dir, "../..")
export const HOSTS = path.join(REPO, "hosts")
export const SECRETS = path.join(REPO, "secrets")
