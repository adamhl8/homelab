#!/usr/bin/env bun

import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { $, Glob, which } from "bun"

if (!which("ttfautohint")) {
  console.error("ttfautohint is not installed")
  process.exit(1)
}

if (!which("fontforge")) {
  console.error("fontforge is not installed")
  process.exit(1)
}

await cleanup()

console.info("Downloading font-patcher...")
await $`curl -fsSLo ./font-patcher.zip https://github.com/ryanoasis/nerd-fonts/releases/latest/download/FontPatcher.zip`.quiet()
await $`unzip ./font-patcher.zip -d ./font-patcher`.quiet()
await $`rm ./font-patcher.zip`

const fontPatcherShebang = `#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["argparse"]
# ///
`

const fontPatcherScript = Bun.file("./font-patcher/font-patcher")
let fontPatcherScriptSrc = await fontPatcherScript.text()
fontPatcherScriptSrc = fontPatcherScriptSrc.split("\n").slice(1).join("\n") // remove existing shebang
await Bun.write(fontPatcherScript, `${fontPatcherShebang}${fontPatcherScriptSrc}`)

console.info("Cloning Iosevka repository...")
await $`git clone --depth 1 https://github.com/be5invis/Iosevka.git`.quiet()

$.cwd("Iosevka/")
console.info("Installing deps...")
await $`bun install`.quiet()

await $`cp ../iosevka.toml ./private-build-plans.toml`
console.info("Building Iosevka...")
await $`bun run build ttf::Iosevka`.quiet()

await $`cp ../iosevka-terminal.toml ./private-build-plans.toml`
console.info("Building IosevkaTerminal...")
await $`bun run build ttf::IosevkaTerminal`.quiet()
$.cwd(process.cwd())

await $`mkdir -p ./in/`
await $`cp ./Iosevka/dist/Iosevka/TTF/* ./in/`
await $`cp ./Iosevka/dist/IosevkaTerminal/TTF/* ./in/`

console.info("Generating nerd fonts...")
const glob = new Glob("in/*")
const fontFiles = await Array.fromAsync(glob.scan())

const promises = fontFiles.map(async (fontFilePath) => {
  const fontFileName = path.basename(fontFilePath)
  console.info(`Processing '${fontFileName}'...`)
  await $`fontforge -script ./font-patcher/font-patcher ${fontFilePath} --quiet --complete -out ./out`.quiet()
  console.info(`Finished processing '${fontFileName}'`)
})

await Promise.all(promises)

await $`cp ./out/* ~/Library/fonts/`
console.info("Copied nerd fonts to ~/Library/fonts/")

await $`cp ./Iosevka/dist/Iosevka/TTF/* ~/dev/adamhl.dev/src/fonts/`
console.info("Copied Iosevka to ~/dev/adamhl.dev/src/fonts/")

console.info("Cleaning up...")
await cleanup()

console.info("Done")

async function cleanup() {
  await fs.rm("./font-patcher", { recursive: true, force: true })
  await fs.rm("./in", { recursive: true, force: true })
  await fs.rm("./Iosevka", { recursive: true, force: true })
  await fs.rm("./out", { recursive: true, force: true })
}
