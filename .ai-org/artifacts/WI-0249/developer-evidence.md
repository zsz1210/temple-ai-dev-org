# Developer evidence

Candidate: `360b1b86266692aadda590b18419d3c3f004c352`.
Developer Identity: `agent-rikku`. Five scoped product files changed.

The shared physical comparison now lives in the existing completion module.
Recovery imports it; all three candidate-check call sites await it. Ordinary
status also treats scope literally. No new package file, dependency or CLI flag.

`node --test test/lean-finish.test.mjs test/lean-finish-recovery.test.mjs`
exited 0 on Node.js v24.20.0: **60 passed, 0 failed/cancelled/skipped/todo**,
136,338.366917 ms. Ten added regression tests cover both identities and flags,
changed/missing bytes, unchanged positives, preview and exact-plan apply,
interrupted journals, diagnostics-time changes, direct deliver and literal
directory inventory. The unchanged recovery suite also passed. `git diff --check`
passed. Full `npm run verify` is running on this exact candidate; no full-suite
pass is claimed here.

Preserved limits: a change after lifecycle writes rejects diagnostic settlement,
not a fictional rollback; restored original inputs permit bounded resumption.
Historical success stays historical. Raw checkout transformations and unsupported
entries fail closed. No general hostile-filesystem concurrency guarantee, external
release, live model experiment or framework-wide speed claim.
