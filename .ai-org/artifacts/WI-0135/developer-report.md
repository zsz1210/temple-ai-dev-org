# Developer report - WI-0135

## Delivered

- Extended the governed effectiveness runner to execute either the frozen four-arm protocol or the registered two-arm optimized Terra confirmation.
- Reused the same isolated repository, Provider handshake, tool-policy, Token-limit, one-attempt, objective-test, blind-package, and score-freeze controls.
- Added a two-arm analyzer that reports condition aggregates, per-case pairs, resource deltas, and the existing v3 decision classification without granting routing authority.
- Ran four Terra candidate turns and one Terra blind evaluator turn under the exact digest-bound approval.
- Retained compact normalized evidence and updated the human-readable validation report. No PDF or local lab was added to Git.

## Experiment result

- Public and held-out objective tests: 4 / 4 pass.
- Arm-neutral blind scores: four scores of 100, frozen before mapping unseal.
- Conventional Terra: 62,825 operational Tokens and 167,011 ms.
- Optimized Temple Terra: 63,930 operational Tokens and 133,990 ms.
- Optimized Temple delta: +1.7589% operational Tokens and -19.7718% latency, with equal blind quality.
- Classification: `neutral`; no routing or model-default change is authorized.
- Combined candidates and evaluator: 149,982 / 209,000 approved operational Tokens, zero retry, zero fallback, zero reroute.

## Verification

- `node --test test/effectiveness-pilot-v2.test.mjs`: 12 / 12 pass before the live run.
- Retained analysis deep-equals the generated lab analysis after removing only the provenance digest field.
- Retained candidate operational totals reconcile to the aggregate.
- `node scripts/check-doc-links.mjs`: pass.
- `node ./templew.mjs schema validate . --json`: 159 documents and 33 schemas valid.
- `npm run verify` at revision `01c0f81412ab9bc590ca2ebe6b9414fae10ed885`: 359 / 359 pass.

## Boundaries

The Provider acknowledged Terra for every turn, but effective turn reasoning effort remained unavailable; the requested medium candidates all reported thread-level high. Monetary cost is unknown. The result covers two bounded cases and does not establish statistical or framework-wide superiority.

No purchased Credits, automatic refill, usage reset, retry, fallback, push, merge, deployment, publication, or release occurred.
