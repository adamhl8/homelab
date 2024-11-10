import { $ } from "bun"
import { normalizePath, resolveLocalPath } from "./paths.ts"

async function getSopsSecret(pathString: string) {
  const keys = pathString.split(".").join("']['")
  return (await $`sops -d --extract "['${{ raw: keys }}']" ${resolveLocalPath("configs/secrets.yaml")}`.quiet())
    .text()
    .trim()
}

async function installAppFromZip(downloadUrl: string) {
  const zipPath = normalizePath("~/tmp_hl_download.zip")
  await $`curl -Lo ${zipPath} ${downloadUrl}`.quiet()
  await $`unzip -o -q ${zipPath} -d /Applications/`.quiet()
  await $`rm ${zipPath}`.quiet()
}

export { getSopsSecret, installAppFromZip }
