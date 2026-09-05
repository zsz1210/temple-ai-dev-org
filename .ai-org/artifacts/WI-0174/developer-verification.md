# WI-0174 — Developer verification and evaluation

- Candidate: `aefa50ba9fb4ca150ba4f8b86d5bbebb1010533f`
- Developer: Rikku (`agent-rikku`)
- Evaluator: Lulu (`agent-lulu`), separate lifecycle evaluation; Independent QA is still required.
- Scope: same-scope review rework, no release or external mutation.

## Candidate results

`npm run verify` passed: **480 tests, 480 pass, 0 fail, 0 skipped**. Node test duration: **75,398.826 ms**. Repository structure, documentation links and package boundary checks passed. The package contains 390 files, 845,538 packed bytes and 3,333,414 unpacked bytes. No new model trial was run.

The new suite contributes 14 deterministic checks (including profile subtests). It covers Lean Test and Standard Test/Eval/Independent QA returns; repeated attempts; archived gates and exact revision rejection; a new Developer claim and handoff; normal closeout with the corrected SHA; terminal and Release Gate refusal; invalid options and missing/unsafe findings; High-Assurance risk and exact-candidate gates; Collaborative sponsor/local binding; active resources and a real CLI-prepared worker reservation; scope drift and current projection clearing; and normalized evidence revision matching.

## Corrections during development

An initial return incorrectly set the next handoff Position to Developer instead of the configured post-Build reviewer. The integration test exposed it; the implementation now uses the workflow's next Position. Fixture setup errors (missing resource display name, missing closeout gates, and declaring affected paths through unsupported configure flags) were corrected before the complete successful run. Older failed local runs are not counted as passes.

## Evaluation and limits

The outcome reduces administrative duplication for a same-scope repair; it does not demonstrate Token savings or delivery speed improvements. Scope confirmation remains an explicit assertion, not semantic verification. File evidence still requires independent review, and historical reports should remain immutable. Real multi-person/multi-machine operation is not established by these fixtures.

`work-item configure --affected-path` is currently accepted by the shared parser but does not add paths. The new rework command rejects unsupported options explicitly; general configure option validation is retained as a separate follow-up, not silently broadened into this change.

The installed schema was refreshed with the supported `temple upgrade` command. No old Work Item history was migrated. Publication, remote integration, cleanup and the other task's comparison remain out of scope.
