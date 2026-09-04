# Temple effectiveness pilot — WI-0130

- Status: completed with one protocol deviation
- Run date: 2026-09-03
- Scope: two bounded implementation cases, three conditions, six candidate turns, and one blind evaluator turn
- Decision boundary: diagnostic evidence only; no statistical or framework-wide superiority claim

## Bottom line

This pilot does **not** show that adding Temple's process alone improved implementation quality. On the one case where both fixed-model conditions passed, Temple used 17.61% more operational Tokens and was 3.92% faster with the same blind score. On the other case, both fixed-model conditions failed the same held-out invariant.

The adaptive condition found that invariant and was the only condition to pass both cases, but it was substantially more expensive. Across both cases it used 76.46% more operational Tokens and 233.60% more model time than Temple Fixed. The current broad rule that sends all bounded quality work to Luna Max should therefore be redesigned, not automated.

There is also a protocol deviation: the live Temple candidates used the `standard` workflow profile, while the registered design required `lean`. The A-versus-B results are valid only as a diagnostic of the observed Standard Temple setup. They are not evidence about the intended Lean Core Path. The runner now detects this mismatch before any future generation.

## What was compared

| Condition | Process observed | Requested execution | Purpose |
| --- | --- | --- | --- |
| Conventional Fixed | Small responsible baseline with tests and Git | GPT-5.6 Terra, medium | Baseline |
| Temple Fixed | Temple Standard workflow | GPT-5.6 Terra, medium | Process comparison |
| Temple Adaptive | Same Temple Standard workflow | Policy-selected GPT-5.6 Luna, max | Route comparison |

All candidates started from matched product files in independent clean repositories. Network access, retries, fallback models, cross-repository writes, and between-candidate intervention were all zero. The evaluator received arm-neutral packages and froze all six scores before the coordinator revealed the condition mapping.

## Aggregate results

| Condition | Correctness | Mean blind score | Operational Tokens | Candidate time |
| --- | ---: | ---: | ---: | ---: |
| Conventional Fixed | 1 / 2 | 78.5 | 51,448 | 90.10 s |
| Temple Fixed | 1 / 2 | 79.5 | 57,903 | 85.52 s |
| Temple Adaptive | 2 / 2 | 99.5 | 102,175 | 285.30 s |

The six candidates used 211,526 operational Tokens. The independent evaluator used 25,122, for a combined 236,648 against the approved 520,000 ceiling. Gross Provider throughput was 2,212,456 Tokens because cached input is included there; it must not be treated as the non-cached operational budget or converted into Credits or money.

## A versus B — process effect

| Case | Conventional Fixed | Temple Fixed | Token change | Time change | Interpretation |
| --- | --- | --- | ---: | ---: | --- |
| Idempotent command | Fail, 58 | Fail, 60 | +8.79% | -6.10% | Excluded from resource qualification; both returned the original state object |
| Compatible event evolution | Pass, 99 | Pass, 99 | +17.61% | -3.92% | Same quality; Temple used more operational Tokens and was slightly faster |

Observed evidence supports this narrow conclusion: the Standard Temple process added consistent Token overhead in these two cases without a correctness gain. It does not establish the effect of the Lean Core Path because that profile was not actually used.

Decision: **simplify and rerun the Lean comparison**. The next harness must construct a real Lean Work Item and load a bounded Context Capsule instead of exposing the full Standard organization surface to a small implementation task.

## B versus C — route effect

| Case | Temple Fixed | Temple Adaptive | Token change | Time change | Interpretation |
| --- | --- | --- | ---: | ---: | --- |
| Idempotent command | Fail, 60 | Pass, 100 | +15.71% | +89.23% | Adaptive recovered a missed invariant, at higher resource use |
| Compatible event evolution | Pass, 99 | Pass, 99 | +152.08% | +393.85% | No quality improvement; large resource regression |

The `idempotent-command` rubric required a fresh returned state object. Both Terra candidates suppressed the duplicate event and balance change but returned the original object. Luna Max returned a fresh object and passed. This is a real result, but the task wording said only to preserve immutable input state; it did not state the reference-identity invariant as clearly as the hidden rubric. The experiment therefore cannot distinguish deeper reasoning from compensation for an underspecified acceptance contract.

Decision: **redesign the `bounded-quality` route**.

- Keep Luna Max available as an advisory escalation, not the default for every bounded task.
- Send explicit, low-risk bounded work to Terra medium.
- When a critical invariant is ambiguous, return to Specification or Design first instead of paying a larger model to guess it.
- Add task-shape signals for ambiguity and semantic-invariant risk before another matched route test.
- Do not enable automatic routing from this result.

## Protocol and evidence quality

| Gate | Result |
| --- | --- |
| Six clean matched candidate repositories | Pass |
| A and B acknowledged the same model | Pass |
| B and C used matched Temple process files | Pass |
| Public and held-out tests retained | Pass |
| Blind scores frozen before mapping reveal | Pass |
| Retry, fallback, intervention, path violation | 0 |
| Registered Lean profile actually used | **Fail — Standard observed** |
| Effective turn reasoning effort directly observed | Unknown |
| Statistical qualification | Not attempted |

The App Server acknowledged the requested model for every turn. It retained the requested reasoning effort, but the thread-level observation was `high` for Terra medium, Luna max, and Sol xhigh, and no effective-turn reasoning field was available. The model comparisons are therefore attributable to the acknowledged models and requested route settings, not to a proven effective reasoning-effort value.

## Product actions

1. Replace the inherited Wave 5 setup helper with a WI-0130-native constructor that creates an actual Lean Work Item.
2. Make the preflight assert workflow profile, scope class, risk tier, routed context digest, and acceptance-contract digest before generation.
3. Add an acceptance-contract completeness check for identity, immutability, idempotency, compatibility, and error semantics.
4. Split `bounded-quality` into an ordinary bounded route and an ambiguity/semantic-risk escalation route.
5. Repeat only the affected A/B and B/C comparisons after these changes; do not rerun unchanged arms merely to seek a favorable result.
6. Use the next pilot variance to design a larger sample. Two cases are insufficient for a general percentage-savings claim.

## Retained evidence

- Canonical observation: `.ai-org/artifacts/WI-0130/live-experiment-observation.json`
- Registered protocol: `.ai-org/artifacts/WI-0130/pilot-protocol.json`
- Frozen local lab: `/path/to/temple-effectiveness-pilot-wi0130`
- Candidate evidence digest: `d06e92781b7f2dc4543e43d411eb81f738f671adfb4978022be9d6d39206926d`
- Final analysis digest: `421855b4aeff407ed3f450a90f63d48613a85950db4709f13f00f1cfd20b377c`
- Frozen score digest: `67650a866f8d05b563a2cf7a0c3e232e8196e2eccd452dad2a84d2f980fe8078`

The raw lab remains local and is not part of the distributable package. The repository observation retains bounded metrics and digests without raw prompts or hidden reasoning.
