import { $ } from "bun"

async function step1() {
  await $`echo step1`
}
async function step2() {
  await $`echo step2`
}

export { step1, step2 }
