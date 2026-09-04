# WI-0138 evidence-backed findings

## Decision

The live run is valid as a completed diagnostic, but its registered effectiveness outcome is inconclusive. Do not rerun the same protocol and do not use this sample to claim Token or latency savings.

## What the run established

- Four of four candidate turns completed once.
- Total observed use was 106,300 Operational Tokens.
- Retry, fallback, reroute, network access, external writes, Credits purchase, automatic refill, and reset use remained disabled.
- Stage-aware source selection was 64.11% smaller for the single-repository fixture and 65.92% smaller for the multi-repository fixture.
- Across both shapes, stage-aware context used 0.30% more Operational Tokens, took 1.68% more model time, emitted 11.03% fewer tool-output bytes, and used 1.45% fewer gross Provider Tokens.
- All exact repository revisions and all operational recovery facts were found by both treatments.

These are descriptive observations from one matched pair per shape.

## Why correctness was marked false

The evaluator compared narrative strings byte-for-byte:

| Field | Frozen expected value | Returned value | Treatments affected |
|---|---|---|---|
| Public test status | `18 passed` | `18 passed.` | Legacy and stage-aware |
| Governing contract | `OrderPlaced/v2` | Identifier followed by the correct compatibility rule | Legacy and stage-aware |

The mismatches do not change the recovered facts, but the frozen protocol defined exact equality as its correctness gate. Post-hoc normalization would change the registered evaluation after observing the outputs, so the retained analysis correctly reports both shapes as inconclusive.

## What the efficiency data means

Reducing selected repository content did not materially reduce Operational Tokens in this sample. The aggregate difference was 160 Tokens, or +0.30% for stage-aware context. Latency was also effectively flat at +1.68%, with opposite directions in the two shapes.

The consistent 8.46% to 14.57% reduction in tool-output bytes suggests that narrower routing reduced repository material exposed through tools. That reduction was too small relative to cached Provider context and the rest of the model turn to produce a clear operational saving here.

## Additional validity limit

All conditions requested Terra with `medium` reasoning and acknowledged the same Terra model. Provider telemetry reported thread effort as `high` and did not expose an effective turn effort. The comparison remains treatment-matched, but it is not a confirmed Terra-medium speed or Token benchmark.

## Required repair before another run

1. Replace `public_test_status` prose with typed numeric fields such as passed and failed counts.
2. Replace `governing_contract` prose with an exact `contract_id`; capture the compatibility rule in its own field.
3. Test the revised evaluator against all four retained completions without model generation.
4. Make reasoning-effort evidence explicit: either verify the effective turn setting or retain it as unavailable and remove effort-specific performance language.
5. Freeze a successor protocol only after the generation-free readiness path proves these cases.

Any successor live run is a new experiment with a new digest and separate approval. The existing four turns must not be silently rescored or counted as a retry.
