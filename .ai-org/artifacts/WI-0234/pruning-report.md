# Redundant test pruning report

The maintainer authorized auditing the previously measured 1250 tests and deleting unnecessary cases. All 117 test files were audited across 10 parent-owned, 50 core, 49 offline-harness and 8 optional files. The exact inventory and acceptance rules are in `audit-inventory.json` and `pruning-plan.md`.

## Completed change

Thirteen unnecessary registrations were removed and one existing browser contract was rewritten across eight files, without deleting a test file, narrowing discovery, introducing skips or changing production behavior. Ten removals have equivalent retained behavioral coverage; three stop locking decorative text or SVG labels. Five duplicate repository-fixture executions were eliminated. Existing detailed scenarios now retain every generic stopped/persisted/sealed/no-turn assertion from those five runs; no distinct failure mode was eliminated. The complete final run confirmed 1237 passing tests and zero failures or skips. Test-source changes add 33 lines and delete 141, a net reduction of 108 lines.

The initial 14-removal candidate was independently rejected before full verification: deleting the browser-table contract lost the guard against an empty viewport list or omitted primary view. The corrected test retains semantic class/target coverage and the actual mobile breakpoint while releasing exact pixel/label pins. `independent-review.md` preserves the rejected attempt and counterexamples; `rework-01-verification.md` describes the correction. Earlier scope audits remain history and must be read with this correction.

| Removed case or category | Count | Remaining protection or intentional difference |
| --- | ---: | --- |
| Static L1-L6 SVG label snapshot | 1 | Link parser and actual missing-asset checks remain. Exact diagram labels are intentionally no longer locked. |
| Browser literal viewport/navigation table copy | Rewritten, not deleted | Retains all four responsive classes, valid increasing dimensions, the mobile breakpoint and six stable navigation targets. Exact pixels/labels/order are no longer fixed. |
| Decorative chamber output and optional-command help prose | 2 | Decorative copy is not enforced. Actual Console/Collector separation and command execution remain tested. |
| Direct terminal-classifier duplicate | 1 | Existing App Server replay fixtures cover completed, invalid schema and interrupted outcomes through the same helper. Exact error prose is not locked. |
| Earlier copy-collision duplicate | 1 | The retained later ordinary copy collision follows the same atomic-create branch, preserves competing bytes, requires EEXIST/no lock and additionally proves rollback. Distinct Claude copy behavior remains. |
| Direct onboarding-schema successful validation duplicate | 1 | Existing installed-schema test validates the same input and plan; explicit checked-document assertions prevent discovery from silently skipping either. |
| Identical format-command and model-observation tests copied into another harness | 2 | Byte-identical tests remain in context-format-comparison with the same imports, input and assertions. Each harness retains its different execution/approval/budget contracts. |
| Repeated partial-usage, early-wrong-usage, private-command, route and interrupt-failure runs | 5 | The same five modes already run in the detailed diagnostic test. The old generic assertion set is now applied to those existing results, avoiding five additional fixture clones/replays. |

Exact old titles, retained test titles, assertion differences and complete file-level retention decisions are in `root-audit.md`, `../WI-0235/audit.md`, `../WI-0236/audit.md` and `../WI-0237/audit.md`, qualified by the browser correction above. Cases were not bundled solely to improve the reported count.

## Why the remaining tests stay

Distinct failure modes and entry points remain necessary even when names overlap. Preserve real CLI wiring alongside module assertions; all field regressions and prior independent-review corrections remain unchanged. Versioned V1-V4 experiment fixtures are still referenced and express different oracle/reference semantics. Authority, identity, path confinement, evidence integrity, rollback, interruption, protocol/accounting and budget-reserve cases remain. Long runtime alone is not a removal reason.

## Developer verification

Node v24.20.0. Focused results: root document tests 3/3, core changed files 48/48, optional changed files 11/11, and harness changed files 40/40 passed, with no failed/cancelled/skipped/todo cases. These are editing evidence, not final integration acceptance. Harness log `/tmp/wi0236-focused-tests.tap` preserves the completed result; the worker's earlier invocation lost its completion capture and is explicitly not treated as passing evidence.

The source baseline is `477e0b60ecbe83caea18430ccb649c67ecd690ca`, with production and tests unchanged from the previous full candidate `8bfe38892283744ba0c71bec0cd25f7cf1a02986`. The preserved baseline log records 1250/1250 and 285611.118583 ms. It was reused as baseline rather than rerun. Corrected candidate `220eda6180c1806d4bc261c9332bf3e55ed92a0b` passed `npm run verify` with 1237/1237 and 288684.186083 ms, about 1.08 percent longer in this single sample. Exact results and raw-log hashes are in `rework-01-verification.md`; `verification.md` is historical evidence for the rejected attempt. The corrected focused browser contract additionally passed 5/5.

During shared-checkout parallel auditing, Doctor exposed duplicate active claim branch identifiers in the prepared worker records. The integration owner released its completed broad claim and then completed/released the finished disjoint workers through the CLI; no validation rule was removed or hidden. Final candidate handoff and closeout use sequential claims. This was coordination-state reconciliation, not grounds for weakening a test or modifying production validation.

## Independent acceptance and closeout

The distinct reviewer `agent-lulu`, runtime `/root/pruning_final_review`, accepted all four named Work Item scopes in `rework-01-independent-review.md`. Six independent faulty selection controls each failed the restored browser contract, while the exact candidate and harmless dimensions/labels/order/additional-viewport control each passed. The original baseline contract rejected that harmless control. The reviewer independently verified all deletion mappings, inventory completeness, exact child-scope compatibility and full-log hashes, without rerunning the complete suite.

The final reproduction script, result metadata and nine raw TAP outputs are preserved in `rework-01-qa-reproduction.tar.gz`, SHA-256 `9db92b328d142f365d2dc6e5d6ee30fe334e37c6a2a085def3b263f89d3d0b01`. This supplies measurement evidence; it does not claim real-browser rendering or live provider verification.

WI-0234 through WI-0237 are `done` with bounded local `go` records. Workers and claims are terminal/released; the refreshed all-active parallel plan contains zero items and conflicts. Final Doctor returned 37 pass, one warning and zero failures. The warning preserves the existing absent actor-policy/legacy verification behavior, which is outside this test-only slice. Final administrative/evidence changes leave all code, tests, scripts, fixtures and package inputs identical to the tested candidate.

## Interpretation and boundary

Removing 13 of 1250 registrations is 1.04 percent. Five eliminated clones/replays and fewer duplicated assertions are concrete reductions; summed concurrent test durations are not wall-clock savings. A later single whole-suite time sample is diagnostic, not a controlled speed benchmark. No model generation, account polling or monetary measurement was performed. The next useful optimization would target repeated setup/CLI startup while retaining unique cases, under a separately authorized scope.

This slice changes tests and work evidence only. No main merge, external publication, downstream adoption or broader policy change is included.
