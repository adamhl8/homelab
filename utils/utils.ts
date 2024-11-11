import { $ } from "bun"
import { resolvePath } from "bun-infra/lib"

async function getSopsSecret(pathString: string) {
  const keys = pathString.split(".").join("']['")
  return (await $`sops -d --extract "['${{ raw: keys }}']" ${await resolvePath("./configs/secrets.yaml")}`.quiet())
    .text()
    .trim()
}

async function installAppFromZip(downloadUrl: string) {
  const zipPath = await resolvePath("~/tmp_hl_download.zip")
  await $`curl -Lo ${zipPath} ${downloadUrl}`.quiet()
  await $`unzip -o -q ${zipPath} -d /Applications/`.quiet()
  await $`rm ${zipPath}`.quiet()
}

function runFishCmd(cmd: string) {
  return $`fish -l -c ${cmd}`
}

export { getSopsSecret, installAppFromZip, runFishCmd }
