# CLAUDE.md (user global)

Personal guidance for Claude Code across all projects.

## Comments

Comments earn their place by explaining _why_, or a non-obvious constraint, not _what_
the code does. Default to fewer comments.

- Don't restate what the code, an assertion, or a test name already says. Delete narration.
- A why-comment is 1-2 lines. Cut history ("used to imply..."), cross-file tours, and
  re-explanations of named helpers.
- In tests, lean on the test name. Comment only a non-obvious setup value, a mock quirk,
  or why-this-shape, not "this asserts X" or step labels.
- JSDoc: one line for a simple function. Don't restate parameter names or types.
- Prose style: no em or en dashes as punctuation (use commas, colons, or parentheses);
  write arrows as `->`. Don't use semicolons.

Trim to the load-bearing why:

    // Before (6 lines)
    // Atomically promotes a draft into the lender's active pipeline without inviting the
    // borrower: status='draft' -> 'in-progress', leaving borrowerInvitedAt null (so the
    // borrower still can't access it ... [3 more lines] ...

    // After (2 lines)
    // Promotes draft -> in-progress, leaving borrowerInvitedAt null so the borrower still has
    // no access or email. WHERE status='draft' is the idempotency guard. Returns null on a non-draft.
