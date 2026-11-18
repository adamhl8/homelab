#!/usr/bin/env bun

import { type } from "arktype"
import { $ } from "bun"

const GIT_SUFFIX = /\.git$/mv

const repoSchema = type({ "parent?": { clone_url: "string" } })

const originUrl = await $`git remote get-url origin`.text()
const repo = originUrl.split(":")[1]?.replace(GIT_SUFFIX, "")
if (!repo) throw new Error(`no repo name in the origin url '${originUrl.trim()}'`)

const response = await fetch(`https://api.github.com/repos/${repo}`)
const validRepo = repoSchema(await response.json())
if (validRepo instanceof type.errors) throw new TypeError(`unexpected GitHub response: ${validRepo.summary}`)

const parentRepoUrl = validRepo.parent?.clone_url
if (!parentRepoUrl) throw new Error(`'${repo}' has no parent repo`)

await $`git remote add upstream ${parentRepoUrl}`.quiet()
console.info(`Added remote 'upstream': ${parentRepoUrl}`)
