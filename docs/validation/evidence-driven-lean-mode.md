# Evidence retrospective: from repeated runs to adaptive workflow

- Work Item: `WI-0118`
- Evidence window: `WI-0107`, `WI-0108`, `WI-0110`, `WI-0112`, and `WI-0117`
- Purpose: decide what Temple should change before another live process comparison
- Status: implementation evidence; not a savings, cost, model-superiority, or statistical claim

## Result in one sentence

The program proved that fail-closed execution and objective candidate checks can work, but it did not prove that Temple saves Tokens, time, money, or rework. The actionable result is to qualify protocols locally, scale workflow ceremony by risk, record terminal no-go outcomes honestly, and measure the next representative comparison before choosing models automatically.

## What the first four attempts measured

| Work Item | Completed candidates | Provider-reported Tokens | Elapsed | Stop reason |
|---|---:|---:|---:|---|
| WI-0107 | 0 | 0 | 4.038 s | Unsupported `uniqueItems` keyword rejected before generation |
| WI-0108 | 0 | 24,456 | 16.821 s | Policy inspected a rendered shell command instead of structured actions |
| WI-0110 | 0 | 77,865 | 32.401 s | Quote-insensitive command policy rejected a literal `|` inside an argument |
| WI-0112 | 0 | 106,646 | 57.923 s | Reactive 80,000-Token ceiling was observed only after the total reached 106,646 |
| **Total** | **0** | **208,967** | **111.183 s** | No comparable candidate output |

These attempts did prove zero automatic retry and zero fallback after a rejected boundary. They also revealed that local transport/schema checks were too weak, command policy was coupled to display formatting, a reactive Token notification can overshoot its nominal threshold, and the interrupted-turn disk counter could report zero despite Git-visible changes.

They did **not** test whether Sol, Terra, or Luna would have produced a better result. The failures happened in experiment infrastructure or stop handling, so using them as model-quality evidence would be invalid.

## What WI-0117 added

WI-0117 completed four Luna Medium candidates once, with zero retry and zero fallback. Every candidate passed public and hidden objective acceptance.

| Measure | Observed result |
|---|---:|
| Candidate turns | 4 started / 4 completed |
| Gross reported Tokens | 872,562 |
| Operational-budget Tokens | 122,226 |
| Candidate latency | 213.097 s |
| Whole program elapsed | 213.699 s |
| Coordinator overhead | 0.602 s |
| Candidate disk delta | 3,128 bytes |

Gross and operational-budget Tokens are different counters and must not be substituted for one another. The retained result uses operational-budget Tokens for its within-program comparison.

Both objective pairs passed. Provisionally, Temple used 3,735 more operational Tokens (+13.29%) and finished 2.485 seconds faster (-4.82%) on the idempotent-command case. On compatible event evolution it used 2,915 more Tokens (+9.82%) and finished 0.336 seconds faster (-0.60%). Across the two cases, the provisional direction is roughly +11.51% operational Tokens and -2.61% latency for Temple.

This is descriptive, not qualified. The first fresh evaluator stopped after crossing its 20,000 operational-Token ceiling. The replacement evaluator then exposed a score-range contract mismatch and stopped before score freeze. No valid subjective score was frozen before mapping unseal.

## Coordination and artifact cost

The five Work Items retained 30 handoffs and 129 artifact files totaling 248,066 bytes. Six explicit account/evaluator approval records were created across the program. These counts show real coordination and repository footprint, but they are only a lower-bound description: they do not include all human waiting time, chat reading, or provider-side storage.

## Supported conclusions

- Fail-closed boundaries prevented hidden retries and fallback.
- The WI-0117 candidates were objectively correct for the two synthetic cases.
- Local preflight can reject a known incompatible protocol without generation once the exact incompatibility is encoded.
- Experiment infrastructure needs the same contract testing discipline as product code.
- A Release Gate no-go can be a completed and useful outcome; it should not remain in the active blocker queue.

## Unsupported conclusions

- Temple reduces Tokens, elapsed time, money, defects, rework, or human intervention.
- Temple is better or worse than the minimal responsible workflow.
- Luna, Terra, or Sol is the best model for this task class.
- Two synthetic cases generalize to real multi-Agent microservice delivery.
- Provider-reported Tokens can be converted into billed Credits without an authoritative price and billing source.

## Changes justified by the evidence

1. Qualify exact schemas, command shapes, score ranges, fixtures, and stop-state persistence locally before model generation.
2. Add Lean, Standard, and High-Assurance workflow profiles with deterministic escalation.
3. Separate terminal `concluded` outcomes from actionable `blocked` work.
4. Preserve failure telemetry even when a turn does not complete.
5. Use one evaluator contract and reject any prompt/schema/parser scale mismatch before launch.
6. Measure interventions, rework, artifact/runtime overhead, cold recovery, boundary conflicts, correctness, Tokens, and latency together.
7. Keep model routing advisory until representative matched evidence exists.

## Evidence sources

- [WI-0107 failed run](../../.ai-org/artifacts/WI-0107/failed-run-observation.json)
- [WI-0108 failed run](../../.ai-org/artifacts/WI-0108/failed-run-observation.json)
- [WI-0110 failed run](../../.ai-org/artifacts/WI-0110/failed-run-observation.json)
- [WI-0112 failed run](../../.ai-org/artifacts/WI-0112/failed-run-observation.json)
- [WI-0117 candidate result](../../.ai-org/artifacts/WI-0117/candidate-result.json)
- [WI-0117 Quality evaluation](../../.ai-org/artifacts/WI-0117/quality-report.md)
- [WI-0117 Independent QA](../../.ai-org/artifacts/WI-0117/independent-qa-report.md)
