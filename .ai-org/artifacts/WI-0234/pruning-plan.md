# Test pruning work order and design

Authorization: the maintainer requested an inventory of unnecessary tests among the prior 1250 results, followed by actual deletion. Baseline: `477e0b60ecbe83caea18430ccb649c67ecd690ca`; its unchanged behavioral candidate `8bfe3889` passed 1250 tests. Current branch: `codex/prune-redundant-tests`.

## Acceptance and decision rule

Audit all 117 `.test.mjs` files and the complete discovered test results. Delete a test only when it checks harmless presentation/implementation details without a distinct behavior, repeats an equivalent retained scenario and assertions, or covers demonstrably unreachable obsolete behavior. Record the exact old title, reason, retained test or replacement assertion, and meaningful coverage differences. A high runtime, old filename or large count alone never justifies deletion.

Protect independent authorization, developer/reviewer identity, cross-reference integrity, path confinement, environment/capability boundaries, stale-input checks, rollback/interruption, external protocol behavior and regressions found by independent review. Production behavior, workflows, policy floors, source scripts, fixtures and provider calls are outside the implementation scope. Do not hide tests with skips, naming changes, narrower discovery, looser assertions or timeouts. Preserve historical experiment repeatability where still supported. Agent instructions are behavioral contracts; ordinary display copy is not.

Delete unnecessary tests and dead test-only imports/helpers with apply_patch. Consolidate assertions only when the retained setup exercises the same entry point, state and failure mode. Counting several cases as one test is not useful deletion; report it separately if needed. Keep representative public CLI end-to-end coverage where unit checks cannot detect wiring errors.

## Ownership

The parent owns ten fast contract files, the aggregate inventory, deletion report and integration. Three disjoint child scopes own core runtime tests, offline harness tests and optional runtime tests, respectively; exact paths are pinned in `audit-inventory.json` and canonical Work Items. These audit buckets are not changes to npm test groups. Each worker audits its entire list, makes justified removals, records retained files with reasons and supplies focused verification. The integration owner reviews cross-scope overlaps before joining. No worker changes production code or another worker's files.

## Verification and stop

Use the existing full baseline log; do not rerun 1250 passing tests just to obtain another baseline. Record removed tests and assertion transfers, before/after inventory, line changes and original slow cases. Run focused tests while editing and one full `npm run verify` on the final committed behavioral candidate. Obtain actual distinct-Identity independent review of deletion equivalence and important negative coverage; run Doctor after canonical closeout. A complete passing smaller suite alone does not prove maintained coverage. Compare timings on Node 24 and clearly label the original single sample and machine contention; no promised speedup, token estimate or account polling.

Finish with accepted local changes, exact evidence and a user-facing removal report. No merge, publication, deployment, downstream upgrade, new model experiment or policy change is authorized.
