import { $ } from "bun"

const EXCLUDED = ["opnsense"]

const incusList = (await $`incus list --format json`.json()) as { name: string }[]
const instances = incusList.map((item) => item.name).filter((name) => !EXCLUDED.includes(name))

console.log("Instances:", instances)
for (const instance of instances) {
  try {
    // biome-ignore lint/performance/noAwaitInLoops: ignore
    await $`incus config unset ${instance} limits.memory`.nothrow().text()
  } catch (error) {
    if (!(error instanceof $.ShellError)) throw error
    if (!error.stderr.toString().includes("it's not currently set")) throw error
  }
}
