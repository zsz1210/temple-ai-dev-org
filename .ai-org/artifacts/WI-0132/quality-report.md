# Quality and evaluation report — WI-0132

## Decision

The corrected experiment completed as registered. All eight candidates passed public and held-out acceptance tests, and all eight arm-neutral blind reviews passed. The evidence is suitable for a bounded diagnostic conclusion, but two cases do not qualify automatic routing or a framework-wide effectiveness claim.

## What the result says

1. **The corrected acceptance contract mattered more than escalation.** After the missing identity and immutability semantics were made explicit, Terra medium passed both cases in both the conventional and native Lean Temple conditions. The earlier WI-0130 Luna-only recovery is therefore better explained as compensation for an underspecified contract than as evidence that every bounded task needs Luna Max.
2. **Native Lean Temple did not improve measured correctness in this sample.** A and B both passed 2/2 with the same 97.5 mean blind score. Temple Terra used 77.94% more aggregate operational Tokens while completing 10.33% faster.
3. **Luna Max was an inefficient default for these explicit bounded tasks.** Against Temple Terra it produced no objective win, scored one point lower on average, used 76.36% more aggregate operational Tokens, and took 266.43% longer.
4. **Sol xhigh is worth retaining as a capability ceiling, not promoting to a default.** Against Luna Max it had the same correctness, scored two points higher on average, used 22.79% fewer aggregate operational Tokens, and took 14.91% less candidate time. With only two cases and no effective-turn effort field, this is promising route-bundle evidence rather than a general model ranking.

## Protocol checks

- Eight isolated candidates and one Terra high evaluator completed.
- Native `lean`, `bounded`, and `low` Work Items were observed for every Temple candidate.
- Product inputs matched across all four arms; Temple context digests matched across B, C, and D.
- All requested models were acknowledged; no reroutes, retries, fallbacks, candidate network access, or path violations occurred.
- Blind scores were frozen before the condition mapping was unsealed.
- Combined operational use was `443632 / 580000` Tokens.
- Candidate time was `868644 / 4500000` ms.
- Effective turn reasoning effort was not exposed by the Provider and remains unknown.
- Monetary cost is unknown; operational Tokens are not a price proxy.

## Interpretation boundary

The pre-registered analyzer labels the C-to-D result `no-observed-advantage` because both arms passed and the experiment did not define a blind-score improvement as an objective correctness win. The observed efficiency and secondary score deltas are still worth following up. Changing the analyzer after seeing the result would compromise this run, so the retained record keeps the registered classification and documents the interpretation gap for the next protocol version.

## Evaluation outcome

`pass` for protocol execution, evidence integrity, and the human-facing diagnostic report. `no-go` for automatic routing, model-ranking, cost-savings, or framework-wide effectiveness claims.
