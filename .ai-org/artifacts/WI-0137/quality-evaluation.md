# WI-0137 quality evaluation

- Work item: `WI-0137`
- Candidate revision: `94d8ceb987ecce2bd444c2ca98209fd4f1a6f66d`
- Evaluator identity: `agent-lulu`
- Developer identity: `agent-rikku`
- Result: pass

## Acceptance evaluation

1. Context resolution defaults to the Work Item's current lifecycle stage and the `primary` purpose. Explicit `--stage` and `--purpose` values are validated and observable in the capsule.
2. Context Map v2 routes may constrain selection by lifecycle stage and purpose. Routes that do not match are excluded, including explicitly pinned routes, and the resolver reports that exclusion rather than silently expanding context.
3. Every v2 capsule includes a deterministic, body-free source manifest with a selection digest, unique-source count, measured-source count, measured bytes, per-source categories, byte size, and SHA-256 digest.
4. Manifest measurement rejects unsafe paths, symlinks, non-files, and paths whose real location escapes the repository.
5. Context Map v1 and Context Capsule v1 remain valid. Fresh initialization seeds Context Map v2, while upgrade preserves existing project-owned Context Maps byte-for-byte.
6. The routing contract remains topology-neutral: one repository measures local sources, a coordinator may later declare component-scoped routes, and autonomous participants retain their own authority.

## Verification

The exact candidate revision was checked in a detached Git worktree. The code and Git state were isolated; the worktree linked the repository's already-installed dependencies corresponding to the committed lockfile so verification did not depend on another network installation.

- Command: `npm run verify`
- Started: `2026-09-04T00:23:32Z`
- Completed: `2026-09-04T00:24:37Z`
- Result: pass
- Repository, documentation-link, and package-boundary checks: pass
- Tests: 400 passed, 0 failed, 0 cancelled, 0 skipped

## Counterexamples covered

- A v1 map containing v2-only routing fields is rejected.
- A v2 route outside the selected stage or purpose is not loaded.
- A source reached through a symbolic link is not measured.
- Duplicate selected paths do not inflate source counts or bytes.
- Source content changes alter the source digest deterministically.
- A primary capsule does not load `TEMPLE.md` merely because it is the recovery fallback.

## Decision and remaining boundary

The implementation satisfies the bounded design and is ready for Independent QA. It makes context selection measurable and stage-aware; it does **not** yet prove lower provider Tokens, lower latency, or better task outcomes. Those outcome claims require a new cold-handoff comparison using the retained WI-0136 baseline and this exact routing behavior.
