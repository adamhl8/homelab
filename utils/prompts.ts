import { $ } from "bun"
import { getInput } from "./helpers.ts"

async function reboot() {
  const response = await getInput("Reboot? [y/N] ")
  if (response.toLowerCase() === "y") {
    await $`sudo reboot`
    return true
  }
  return false
}

async function continuep() {
  const response = await getInput("Continue? [Y/n] ")
  return response.toLowerCase() !== "n"
}

export { continuep, reboot }
