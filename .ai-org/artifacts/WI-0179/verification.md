# WI-0179 — Developer verification and evaluation

Candidate: `175f7ada3821b6e57e5b176f5e7af6624144abec`.
Source digest: `sha256:d31aff9ed119e2532d8f4ccc00d0ada1f6e2f76d676602f022c5badb7fe56e96`.
Process contract: `delivery-process/v6`, `sha256:96977af8fa19b6aa1e79d31ff9a60415165b4ec98d871362e765565df3abdd69`.

## Observed checks

- `npm run verify`: 568 tests passed, zero failures, 98.224 seconds. Repository, documentation-link and package checks also passed. This checks the harness/framework, not the effectiveness of Temple.
- Focused policy and matrix tests: 15/15. They cover matched order and totals, whole-matrix approval binding, changed models and budgets, read-only preparation, claim/identity/revision restrictions, compact flags, literal preview syntax, treatment adherence and output-volume accounting.
- `sandbox-readiness.json`: actual installed Codex `command/exec` sandbox, four completed injected actor stages, 81 commands and two rejected outside writes. Both products passed supplied/added/hidden checks, and Temple reached the expected released claims, exact handoff and Lean closeout. Compact Context and composed delivery were actually invoked. No real model thread or model turn was started; synthetic Token counters are excluded from comparison results.
- Installed CLI: `codex-cli 0.153.1`. Generation-free schema/config/model probes confirmed `gpt-5.6-terra / medium` and `gpt-6-astra / medium` availability. These are requested routes, not proof of a future actor's effective turn effort.
- Main's provider implementation is unchanged. The old comparison branch remains clean; its two frozen protocols and comparison artifact retain the three SHA-256 values recorded in the preceding work order.

## Retained failures and corrections

The first harness replay exposed root evidence incorrectly included in committed product scope. Delivery records contain the candidate SHA and are intentionally written after the product commit. The setup now declares the two product paths; the observer still explicitly restricts delivery/verification evidence writes. No product-cleanliness or exact-revision guard was weakened.

The literal recognizer initially used a prefixed expected-plan digest. The installed delivery implementation requires bare 64-hex SHA-256; the guide, recognizer and tests now match that contract.

An earlier full-suite invocation, run concurrently with the real sandbox exercise, passed 565/566 checks but timed out in the existing optional Console refresh test's two-second wait. That test passed alone in 0.774 seconds. The final full-suite run above, without concurrent sandbox work, passed. Load sensitivity is a hypothesis, not a proven root cause. No Console source or timeout was changed, and the failed run is not erased by the passing rerun.

## Evaluation and remaining boundary

The candidate can distinguish correct products from valid lifecycle completion and actual use of the optimized treatment. Successful previews, failed commands, or prompt instructions alone cannot count as composed delivery. Output sizes are observations, not inferred model Tokens.

Fresh matched live results are pending. There is no claim that Temple is faster, cheaper or better. The proposed full matrix needs explicit aggregate approval, exact-source Independent QA and frozen fresh labs before execution. Historical results remain context only. Stop after the approved matrix and its report; do not change routing policy or launch additional comparisons automatically.

Rollback is a normal revert of the isolated harness commit. No deployed service, global configuration, published package or sealed historical experiment was changed.
