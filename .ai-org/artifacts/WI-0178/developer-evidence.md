# Developer evidence

Candidate: `6521fc50047478ced59cd9fe0a65f1d4d2c4c3df`.

The candidate selectively integrates the earlier Lean delivery implementation and tests while retaining main's handoff actor, immutable revisions and same-scope review-rework guards. It adds compact read-only Context, grouped authority freshness metadata, typed new-surface errors and conditionally routed lifecycle Skill references. Source and installed managed files were synchronized only through the supported upgrade; the root project-owned AGENTS prefix is preserved. No comparison history or external dependencies were imported.

Completed local checks:

- `node --test test/lean-delivery.test.mjs test/work-item-rework.test.mjs`: 31 passed, zero failed/skipped; 29,668.499 ms. Includes each journal/write boundary, idempotency, changed input/output, eligibility and normalized-evidence expiry, existing Standard/High-Assurance/Collaborative rework protections.
- `node --test test/delivery-entry.test.mjs test/context.test.mjs`: 18 passed, zero failed/skipped; 10,530.474 ms. Includes the new composed rework path, pending recovery visibility, scope/acceptance preservation, changed authority hashes, missing source warnings and read-only input failures.
- `node --test test/skill-policy.test.mjs`: 3 passed; includes reference reachability and existing workflow/authority contracts. These checks are structural, not model adherence.
- `npm run check` passed: repository and links; 399 package files, 861,213 packed bytes at the time of this check.
- `git diff --check` passed. Supported upgrade completed with 93 checksum-managed files and no failed Doctor checks; the expected stale dispatch-plan warning remains until replanning.

The external `skill-creator` Python quick validator could not run because PyYAML is unavailable in both installed Python runtimes. No dependency was installed to work around this; repository frontmatter, scenario, link and installation checks ran instead. This is an explicit unavailable auxiliary check, not a pass.

Full verification and the independent review are complete for the same candidate:

- First `npm run verify`: 514 passed, one failed, zero skipped; test phase 92,954.884 ms. `test/optional-console-collector.test.mjs` timed out waiting for a Console refresh signal within its 2,000 ms deadline. This run started while the local administrative measurement was still active.
- Inspected the refresh subscription and watcher setup. Both the Console implementation and this test are byte-identical to the base. No source or timeout was changed to obtain a pass. The cause of the single timeout is not proven.
- Isolated `node --test test/optional-console-collector.test.mjs`: 8 passed, zero failed/skipped; 4,021.622 ms. The refresh test passed in 726.746 ms including fixture setup.
- One bounded repeat of complete `npm run verify`, with no other test/measurement runner active: 515 passed, zero failed/skipped; test phase 91,813.427 ms. The refresh test passed in 1,822.881 ms including fixture setup. Repository, links and package checks also passed.
- Separate `agent-lulu` Independent QA reproduced 42 focused tests and an actual CLI interrupted-delivery/recovery/replay exercise; see `independent-qa.md`. The Developer Identity is `agent-rikku`.

The first failed result remains recorded; the passing repeat is not proof that the existing timing-sensitive test is fixed. Recurrence should be investigated as a separate Console reliability/test-design issue rather than answered with repeated retries or a larger timeout.

The local administrative measurement ran while full verification was starting; its elapsed times are descriptive under that load, not a clean latency comparison. CLI operation counts and serialized output sizes remain directly observable. The unchanged sealed comparison and final evidence-only checks are joined in `integration.md`. No model Token/quality/latency benefit is claimed.
