# CLAUDE.md (user global)

Personal guidance for Claude Code across all projects.

## This machine

- **Shell tools are GNU, not BSD, despite macOS.** Homebrew `gnubin` dirs come first on PATH, so
  `sed`, `awk` (gawk), `grep`, `find`, `xargs`, `tar`, `diff`, and all of coreutils (`date`,
  `stat`, `readlink`, `ls`, `cp`, `mktemp`, `base64`, ...) take GNU flags. Write
  `sed -i 's/a/b/' f`, never `sed -i '' ...`. Use `date -d`, not `date -v`. Use `stat -c`, not
  `stat -f`. Use `readlink -f` freely.
- The exceptions are `make` (Apple's GNU Make 3.81), `patch`, and `getopt`, which are the stock
  macOS versions.

## Working style

- **Work on whatever branch is checked out, and never create a branch unasked.** This includes
  `main`. On a detached HEAD, or a branch whose name clearly has nothing to do with the task,
  ask whether to create a new branch before making changes.
- **Never commit, push, or open a PR unless asked.** I review and commit changes myself. When a
  skill's step says to commit, skip it and leave the changes uncommitted, except in skills that
  rely on per-task commits (for per-task review or recovery). Before starting one of those, ask
  whether it may commit on the current branch for that run. Temporary WIP commits that set work
  aside are fine, as long as they're undone in the same step and reported.
- **Commits are a subject line only.** No body, no Co-Authored-By line, no session trailers.
  This overrides any harness attribution reminder.
- **Superpowers specs and plans are uncommitted working files.** Keep them in
  `docs/superpowers/specs/` and `docs/superpowers/plans/` where the skills expect them, but never
  `git add` or commit them, even when a skill says to. The global gitignore excludes that path.
- **Keep lasting project knowledge in the project's `AGENTS.md`, not auto memory,** which is off.
  When a decision, convention, or gotcha comes up that a later session needs and the docs and
  code don't make obvious, add it to `AGENTS.md`, creating it if it's missing. File it under the
  topic it belongs to, and tell me what you added.
- **Prefer integration and end-to-end tests over unit tests, and avoid mocks when you can.** Use
  real inputs, real temp files, real subprocesses. Add in-process unit tests only when an
  integration test genuinely can't reach the goal. A mock (including `vi.mock`) is fine when it
  clearly makes more sense than the real thing. Say so when you use one, and why.
- **Tests never call external or paid third-party services.** Stand in for them with a local HTTP
  server that answers like the real one, or a mock when that is simpler.
- **Prefer a framework's built-in over hand-rolled code or a new dependency.** Before proposing a
  custom theme, config, or package, check what the framework already ships and say so. If the
  built-in has a real flaw, design around it and flag it rather than replacing it.
- **Lint and type-checker suppressions go inline at the violation site** (`noqa`, `ty: ignore`,
  `oxlint-disable-next-line`). Triage as fix the code > inline suppression > per-file override
  (only for many hits of the same rule) > global ignore (only for rules irrelevant project-wide).
  Lint configs enable all rules and disable the truly irrelevant ones.
- **TypeScript scripts that shell out use Bun's `$` shell** (`import { $ } from "bun"`), not
  `node:child_process`.
- **Subagents run on the same model as the session that spawns them, unless I explicitly say
  otherwise.** Pass the session's model explicitly on every dispatch, because an agent type's own
  default model can override inheritance. This overrides any skill's model-selection guidance,
  such as the superpowers tiers that pick cheaper models per task.
- **When a subagent dies on an API error (429/500/529), rerun or resume it as originally
  spawned** (same prompt, same model) and wait for it to finish before presenting conclusions.
  Never narrow its brief, swap its model, or quietly do its work yourself. Report the attempt
  count and the error honestly.
- **Trust Drizzle codegen for migrations.** On any schema change run `db:generate` first, inspect
  the generated SQL, and ship it if it's right. Hand-edit only when the output is genuinely wrong,
  and pair any hand-edit with extensive testing (local migrate, integration test, end-to-end
  exercise of the affected paths).

## Rulings lists

When a skill asks for a "Rulings I made" list with "what it costs if wrong", keep every ruling
but drop the "If wrong:" slot. Group the rulings in this order and skip empty groups:

- **Your call**: judgment calls I might decide differently. State what you picked and why,
  then "If you'd rather <the other option>: <what changes>."
- **Accepted trade-offs**: known downsides you chose to live with. Say when it happens and who
  notices.
- **Scope**: anything bundled into this work or left as a follow-up, and why.
- **FYI**: decisions with no realistic downside, one line each.

Each ruling stands alone. Name the concrete behavior, not a hypothetical.

## Comments

Comments earn their place by explaining _why_, or a non-obvious constraint, not _what_
the code does. Default to fewer comments.

- Don't restate what the code, an assertion, or a test name already says. Delete narration.
- A why-comment is 1-2 lines. Cut history ("used to imply..."), cross-file tours, and
  re-explanations of named helpers.
- In tests, lean on the test name. Comment only a non-obvious setup value, a mock quirk,
  or why-this-shape, not "this asserts X" or step labels.
- JSDoc: one line for a simple function. Don't restate parameter names or types.
- Never reference an issue, PR, or ticket. The exception is a link that explains why the code
  exists at all.
- A one or two word comment is either noise or too compressed to help. Remove it, or expand it
  into a real sentence.
- Prose style: ASCII only. Use only characters you can type directly on a keyboard. No em or en
  dashes (use commas, colons, or parentheses), no curly quotes, no ellipsis character, no arrows
  (write `->`). Semicolons are ASCII but still off limits. This governs prose and comments, not
  string literals or data the product renders.

Trim to the load-bearing why:

    // Before (6 lines)
    // Atomically promotes a draft into the lender's active pipeline without inviting the
    // borrower: status='draft' -> 'in-progress', leaving borrowerInvitedAt null (so the
    // borrower still can't access it ... [3 more lines] ...

    // After (2 lines)
    // Promotes draft -> in-progress, leaving borrowerInvitedAt null so the borrower still has
    // no access or email. WHERE status='draft' is the idempotency guard. Returns null on a non-draft.

### Comment wording

Once a comment has earned its place, write it like this:

- **Open with a verb** naming what the code does: "Pin `createdAt` so...", "Looks up the picked
  file and rejects it if...", "Get by filename because...". Never open with a fragment or a
  dangling participle ("Pinned so...", "By filename, since..."). The reader should not have to
  scan the next line to find the subject.
- **Name the identifier**, in backticks. "Pin `createdAt`", not "Pinned".
- **One fact per sentence, one sentence per line.** Two short declaratives beat one sentence with
  a subordinate clause hanging off it. No comma splices.
- **Plain words.** Prefer because over since, have over carry, relies on over reads, omitted over
  deliberately without. Never invent a verb from a noun ("default a year", "settle the entity").
- **State what is, not what would otherwise be.** Skip counterfactuals ("without this the tax
  return would win...") and consequence chains. If the point is "nothing else checks this", write
  exactly that.
- **No precision theater.** "the ordering of the inserts", not "intra-millisecond ordering of two
  back-to-back inserts".
- **Do not name fixtures or data from other files.** "the full-year case", not "Gwen's Y-1".
- Contractions are fine.

JSDoc follows the same rules, starting with what the function does.

Calibration:

    // Before
    // Pinned so the default does not depend on intra-millisecond ordering of two inserts.
    // After
    // Pin `createdAt` so the default does not depend on the ordering of the inserts.

    // Before
    // Rows arrive newest-first, the order `resolveDscrYearDocument` reads to default a year.
    // After
    // The query ordered these newest-first, which `resolveDscrYearDocument` relies on.

    // Before (3 lines)
    // Deliberately without a fileId, so the loadout covers a row that names only a source. Without
    // the row at all the tax return would win by default and Gwen's Y-1 would lose its full-year,
    // non-annualized statement demo.
    // After (2 lines)
    // Picks the full-year / non-annualized source.
    // `fileId` is omitted so we cover the `source`-only case.
