#!/usr/bin/env bun

import { type } from "arktype"
import { $ } from "bun"

const repoSchema = type({ "parent?": { clone_url: "string" } })

const url = await $`git remote get-url origin`.text()
const repo = url.split(":")[1]?.replace(/\.git$/mv, "")
if (!repo) throw new Error("failed to get repo name")

const repoData = repoSchema(await (await fetch(`https://api.github.com/repos/${repo}`)).json())
if (repoData instanceof type.errors) throw new Error(`unexpected GitHub response: ${repoData.summary}`)

const parentRepo = repoData.parent?.clone_url
if (!parentRepo) throw new Error("failed to get parent repo name")

await $`git remote add upstream ${parentRepo}`.quiet()
console.info(`Added remote 'upstream': ${parentRepo}`)
