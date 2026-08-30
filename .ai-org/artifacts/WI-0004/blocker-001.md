# WI-0004 Blocker Record

- Detected: 2026-08-30T03:27:16Z
- Gate: final repository doctor
- Status: unresolved

## Observation

The rewritten README files pass repository checks, documentation links, the full 136-test suite, clean-worktree Independent QA, and GitHub GFM rendering. The final `temple doctor` fails because two historical WI-0003 test evidence entries stored digests for the mutable README paths and the current validator compares those historical digests with the present working-tree files.

Affected evidence:

- `EVID-20260830T031116Z-D44A390B`
- `EVID-20260830T031240Z-60E4A8C3`

## Why this blocks closeout

The failure is not a defect in the new README copy, but bypassing or rewriting historical evidence would weaken Temple's evidence boundary. Resolving it correctly requires a separate framework decision: validate revision-bound artifacts against their recorded Git revision, or provide a supported invalidation mechanism whose artifacts are no longer checked against mutable working-tree paths.

## Required resolution

Approve a separately scoped framework fix and tests, then rerun `temple doctor` and close WI-0004 only after all checks pass.
