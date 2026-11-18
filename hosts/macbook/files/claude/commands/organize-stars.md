---
description: Sort GitHub stars into domain-based star lists (creates lists on first run)
---

# Organize GitHub Stars into Star Lists

Organize my GitHub stars into star lists on my profile, following these conventions and the process below.

## Conventions

- Lists are domain / use-area based (e.g. "Terminal & Shell", "Self-Hosted Apps", "Obsidian"), never by programming language.
- Exactly one list per repo, the most specific fit wins. Repos that genuinely fit nothing go in a "Misc" list.
- Lists are public. GitHub caps accounts at 32 lists: prefer ~25-30 specific lists over a few broad ones, but leave a couple of slots free.
- Reuse my existing lists and their spirit. Only create a new list when a real cluster (4+ repos) has no home; fold would-be tiny lists into the nearest existing one.

## API facts (verified 2026-07)

- The REST API cannot manage star lists. Use GraphQL via `gh api graphql`: `createUserList(input: {name, description, isPrivate})`, `updateUserListsForItem(input: {itemId, listIds})`, `updateUserList`, `deleteUserList` (rollback).
- `updateUserListsForItem` REPLACES the item's entire list membership. `itemId` is the repository node ID.
- Needs a token that can write stars: a classic PAT with `user` scope works. Check `gh auth status` first.
- Fetch stars (paginate 100/page with `after`): `viewer { starredRepositories(first: 100, orderBy: {field: STARRED_AT, direction: DESC}) { pageInfo { hasNextPage endCursor } nodes { id nameWithOwner description repositoryTopics(first: 10) { nodes { topic { name } } } } } }`
- Fetch lists + members: `viewer { lists(first: 32) { nodes { id name items(first: 100) { totalCount nodes { ... on Repository { nameWithOwner } } } } } }` (paginate `items` if a list exceeds 100 repos).
- "Not in any list yet" = all starred `nameWithOwner` minus the union of every list's items. No REST needed.
- List descriptions cap at 160 characters.

## Process

1. Fetch all stars and all existing lists into a scratch dir. Compute the unlisted set. If everything is already listed, report that and stop.
2. Read every unlisted repo's name, description, and topics, and assign each to a list using judgment (do not categorize by primary language). Write the mapping to a file grouped by list name.
3. Validate before mutating anything: every unlisted repo mapped exactly once, no mapped names that aren't actually starred (typos), no duplicates. Diff the sorted name sets with `comm` both directions.
4. Create any new lists with a short description; capture the returned list IDs.
5. Assign repos with `updateUserListsForItem`, batching ~20 aliased mutations per GraphQL request with a ~1s pause between batches. Log any batch errors instead of aborting.
6. Verify end-to-end: re-fetch all lists; per-list item counts must sum to the total star count and the starred-minus-listed diff must be empty. Fix any misses.
7. Report a list -> count table and call out judgment-call placements I might want to move.

Sorting new stars into existing lists needs no confirmation. Ask me first only before creating new lists, or renaming/merging existing ones.
