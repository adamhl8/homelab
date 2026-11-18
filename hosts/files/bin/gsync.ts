#!/usr/bin/env bun

import { $ } from "bun"

const originBranch = await $`git remote show origin | awk '/HEAD branch/ {print $NF}'`.text()
await $`git pull --rebase`
await $`git fetch origin ${originBranch}`
await $`git rebase origin/${originBranch}`.nothrow()
