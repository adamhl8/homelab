#!/usr/bin/env bun

import { $ } from "bun"

const upstreamBranch = await $`git remote show upstream | awk '/HEAD branch/ {print $NF}'`.text()
await $`git pull --rebase`
await $`git fetch upstream ${upstreamBranch}`
await $`git rebase upstream/${upstreamBranch}`.nothrow()
