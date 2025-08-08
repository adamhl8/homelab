#!/usr/bin/env bun

import { $ } from "bun"

const url = await $`git remote get-url origin`.text()
const repo = url.split(":")[1]?.replace(/\.git$/m, "")
if (!repo) throw new Error("failed to get repo name")

const repoData = (await (await fetch(`https://api.github.com/repos/${repo}`)).json()) as {
  parent?: { clone_url: string }
}
const parentRepo = repoData.parent?.clone_url
if (!parentRepo) throw new Error("failed to get parent repo name")

await $`git remote add upstream ${parentRepo}`.quiet()
console.info(`Added remote 'upstream': ${parentRepo}`)
