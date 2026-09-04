# WI-0140 developer verification

## Candidate

- Harness source revision: `70a98b4a8d07bb27f1c2f91fa1cbbea06113adef`
- Frozen protocol: `3d9544fd40468f8ad7bdb448b81255ed69e3ba256e74f6fd444eba93a7e5800f`
- Model route: requested and thread-configured `gpt-5.6-terra` / `medium`
- Live Provider candidate generation: not performed

## Repository verification

`npm run verify`

- repository checks passed;
- documentation links passed;
- package boundary passed;
- 408 tests passed and 0 failed.

## Focused route-adherence verification

`node --test test/context-capsule-ablation.test.mjs`

- 8 tests passed and 0 failed;
- the retained WI-0139 censoring and multi-repository regression reproduce without rescoring history;
- the 51,000 single-repository stop limit derives from the retained 40,460-Token lower bound and declared headroom rule;
- both repetitions use matched repositories and context selections while strategy order is counterbalanced;
- routed, off-route, unknown, failed, ambiguous multi-action, overflow, and symlink-escape cases behave fail-closed;
- retained acquisition evidence contains no raw commands or command output.

## Generation-free readiness

`node scripts/run-context-capsule-ablation.mjs prepare`

- protocol v3 froze eight conditions at the exact source and harness revision;
- the Provider handshake acknowledged Terra / medium and performed no candidate turn;
- condition limits total 524,000 Operational Tokens;
- raw prompt, response, reasoning, command, and output retention are disabled.

`node scripts/run-context-capsule-ablation.mjs rehearse`

- 52 readiness checks passed;
- 8 conditions were simulated from injected expected facts;
- candidate and evaluator turns: 0;
- Operational Tokens: 0;
- retry and fallback: 0;
- model generation: false.

`node scripts/run-context-capsule-ablation.mjs preflight`

- lab, harness binding, Provider contract, predecessor integrity, and readiness passed;
- the only blocker is `exact-approval`;
- model generation remains disabled.

## Predecessor integrity

`git diff --quiet 1461cf6 -- .ai-org/artifacts/WI-0139` returned success, and the WI-0139 artifact subtree has no working-tree changes. Preparation and preflight both bind and recheck the retained observation digest.

## Remaining boundary

The measurement implementation and generation-free protocol are ready for evaluation. A live eight-turn comparison is a separate account-impacting action and still requires an affirmative approval record that exactly matches `account-approval.template.json`.

