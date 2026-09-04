# WI-0139 developer verification

## Candidate

- Harness source revision: `3f39447504a7391f5554e81f1454c7cbda31daa1`
- Frozen protocol: `ef5c9608f83fb7a70793f64d400f0c2434a8c1f1ccf8f37a7cbea9dc665ea81b`
- Model route: requested and thread-configured `gpt-5.6-terra` / `medium`
- Effective per-turn reasoning effort: unavailable; not inferred

## Focused verification

`node --test test/context-capsule-ablation.test.mjs`

- 6 tests passed;
- typed facts accept the exact expected recovery state;
- malformed shapes, short revisions, negative test totals, absolute authority paths, duplicate slices, malformed contracts, and malformed authority IDs fail;
- output schemas contain no `const`, `enum`, `default`, or `examples` keys;
- retained WI-0138 display variants project to the same typed test totals and contract ID without changing the historical result;
- an unapproved preflight has exactly one blocker: `exact-approval`;
- a configured reasoning-effort mismatch invalidates the protocol.

## Repository verification

`npm run check`

- repository checks passed;
- documentation links passed;
- package boundary passed.

The full `npm run verify` result is recorded separately after the frozen readiness artifacts are committed.

## Generation-free readiness

`node scripts/run-context-capsule-ablation.mjs prepare`

- protocol v2 frozen at `ef5c9608f83fb7a70793f64d400f0c2434a8c1f1ccf8f37a7cbea9dc665ea81b`;
- installed Codex CLI: `0.153.0-alpha.5`;
- Terra lists `medium` as supported;
- ephemeral thread start acknowledged `gpt-5.6-terra` and configured `medium`;
- both Structured Output schemas passed the portable-subset and answer-leak checks;
- no `turn/start` request or model generation occurred.

`node scripts/run-context-capsule-ablation.mjs rehearse`

- 29 readiness checks passed;
- 4 conditions were simulated with injected expected facts;
- candidate turns: 0;
- evaluator turns: 0;
- Operational Tokens: 0;
- retry: 0;
- fallback: 0;
- model generation: false.

`node scripts/run-context-capsule-ablation.mjs preflight`

- lab, source binding, Provider contract, and readiness checks passed;
- generation remains disabled;
- only blocker: `exact-approval`;
- no WI-0139 approval record exists.

## Historical integrity

`git diff --quiet b766d67 -- .ai-org/artifacts/WI-0138` returned success. The aggregate SHA-256 over sorted WI-0138 artifact file hashes is `41df59400b67e3395beced849f4f97b4e496b94e3229de903c0d46b5826da990`. WI-0138 was not modified or rescored.

## Remaining boundary

The harness is ready for Independent QA of the exact candidate. A later live comparison still requires a new affirmative WI-0139 approval whose protocol digest and limits exactly match `account-approval.template.json`.
