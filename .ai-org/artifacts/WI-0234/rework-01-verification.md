# Test pruning QA-01 correction

Developer: agent-rikku, Principal: human. The earlier aggregate candidate `93fe381da11621d48493f350e67f9b8bfa51ef8c` was rejected before full verification. `independent-review.md` demonstrates that deleting the complete browser table contract permitted empty viewport selection and omission of a primary navigation target to escape the remaining contract tests.

Restored one semantic coverage test in `test/console-browser-contract.test.mjs`. It requires all four named responsive classes with valid dimensions and increasing widths, checks both sides of the actual mobile-sidebar breakpoint, and requires the six stable primary navigation targets. Exact pixel dimensions, human-readable labels, array order and additional viewports are not pinned. No production browser code or test-discovery rule changes.

The final scope removes 13 registrations and rewrites one existing test. Other deletion mappings remain unchanged. The original worker audits and rejected review remain as history, not final acceptance. The corrected browser-contract focused command `node --test test/console-browser-contract.test.mjs` passed five tests, zero failures/skips, 255.2605 ms on Node v24.20.0. The exact corrected candidate is `220eda6180c1806d4bc261c9332bf3e55ed92a0b`.

## Complete verification

The integration owner ran `npm run verify` once on the committed corrected candidate. Exit status 0: repository checks, documentation links and package boundary passed; the complete suite discovered 117 test files and returned 1237 tests, 1237 pass, zero fail/cancelled/skipped/todo, runner duration 288684.186083 ms. This is actual complete Developer verification, not independent acceptance. No full suite was run on rejected candidate `93fe381d`.

Raw output is preserved in `verification-220eda61.log.gz`. Compressed SHA-256: `7f52e73ca25e53051990395c1de21edaf756e934d5c0ac67bcb9f39571e94134`. Uncompressed SHA-256: `c93054ee41afbbbcfb24f1d4121cba156f7410854ddf5a2ce332b31b4d6f7dfc`. Node v24.20.0 on macOS. The existing recursive node:test runner warning is not a new test skip; reported skipped results are zero.

The original baseline returned 1250 pass and 285611.118583 ms. The corrected run was 3073.0675 ms (about 1.08 percent) longer. These are single concurrent-machine samples, not a controlled benchmark; no wall-clock speed improvement is established. The structural reductions are 13 registrations, five duplicate repository-fixture executions and 108 net test-source lines across eight files. No model usage, cost estimate or account polling is included.

WI-0235 and WI-0236 were handed off at `93fe381da11621d48493f350e67f9b8bfa51ef8c`. Their exact owned test paths are unchanged at `220eda6180c1806d4bc261c9332bf3e55ed92a0b`; the sole intervening test-source change is the WI-0237 browser contract. The final independent reviewer must judge this scope compatibility explicitly. Parent WI-0234 and corrected WI-0237 use the final candidate directly.

## Final acceptance

The fresh `rework-01-independent-review.md` records the actual distinct-Identity reviewer PASS for all four scopes, including the exact compatibility judgment above. All six negative browser-selection controls were caught, while harmless selection-detail changes passed. CLI closeout completed WI-0234 through WI-0237, released ownership, and refreshed an empty active plan. Final Doctor: exit 0, 37 pass, one pre-existing absent actor-policy warning, zero failures. Later source/test changes: none. The final evidence-only consistency command is `npm run verify:fast`; its output is retained separately as `closeout-verify-fast.log.gz` after execution.
