# Native Lean routing effectiveness result

- Work Item: `WI-0132`
- Run date: 2026-09-03
- Registered protocol: `84d30df16d72bfbae6ac1d111729ddab9e90d761c46a8694250955985028bc45`
- Scope: two bounded implementation cases, four conditions, eight candidates, and one blind evaluator
- Claim boundary: diagnostic evidence only; no automatic routing or framework-wide superiority claim

## Bottom line

The corrected experiment produced a useful answer: **for clearly specified, low-risk, bounded implementation work, Terra medium was enough.** All four conditions passed both cases. Luna Max spent substantially more Tokens and time without improving correctness, while Sol xhigh was more efficient than Luna in this small sample but did not add an objective correctness win.

Temple's Lean process did not improve correctness over the responsible conventional baseline in these two cases. It did finish about 10% faster, but used about 78% more operational Tokens. The most actionable Temple improvement is therefore not “use a stronger model”; it is **make the routed context smaller while keeping the explicit acceptance contract**.

## What was compared

| Arm | Process | Requested route | Purpose |
| --- | --- | --- | --- |
| A | Responsible conventional | Terra medium | Baseline |
| B | Native Lean Temple | Terra medium | Isolate process effect |
| C | Same native Lean Temple | Luna max | Measure bounded-work escalation |
| D | Same native Lean Temple | Sol xhigh | Measure the flagship ceiling |

All candidates started from matched product files in isolated clean repositories. The Temple arms shared the same routed-context digest for each case. The blind evaluator saw arm-neutral packages and froze all eight scores before the coordinator revealed the mapping.

## Aggregate results

| Condition | Objective correctness | Mean blind score | Operational Tokens | Candidate time | Mean context |
| --- | ---: | ---: | ---: | ---: | ---: |
| Conventional Terra | 2 / 2 | 97.5 | 49,926 | 108.87 s | 2,166 B |
| Temple Terra | 2 / 2 | 97.5 | 88,836 | 97.63 s | 15,435 B |
| Temple Luna | 2 / 2 | 96.5 | 156,673 | 357.74 s | 15,435 B |
| Temple Sol | 2 / 2 | 98.5 | 120,960 | 304.41 s | 15,435 B |

The candidates used 416,395 operational Tokens and the evaluator used 27,237, for a combined 443,632 against the approved 580,000 ceiling. Candidate execution took 868.64 seconds in total. Gross Provider throughput was 4,375,664 Tokens because cached input is included there; it is not the approved operational budget and does not reveal monetary cost.

## Per-case results

| Case | Conventional Terra | Temple Terra | Temple Luna | Temple Sol |
| --- | --- | --- | --- | --- |
| Idempotent command | Pass · 98 · 23,924 | Pass · 97 · 33,801 | Pass · 97 · 85,442 | Pass · 99 · 42,463 |
| Compatible event evolution | Pass · 97 · 26,002 | Pass · 98 · 55,035 | Pass · 96 · 71,231 | Pass · 98 · 78,497 |

Each cell is `objective result · blind score · operational Tokens`.

## A to B — process effect

Both conditions passed 2/2 and had the same mean blind score.

- Temple Terra used 77.94% more aggregate operational Tokens.
- Temple Terra was 10.33% faster in aggregate candidate time.
- Temple added a median 13,269 UTF-8 bytes of context per case.
- Of the roughly 15.4 KB Temple prompt context, about 9.35 KB came from candidate instructions and about 4.41 KB from routed context in the inspected idempotent case.

**Decision:** preserve the acceptance contract, then reduce instruction and routed-context overhead before repeating the process comparison. This run does not demonstrate a Temple quality advantage, and it does not justify a savings claim.

## B to C — Luna escalation

Both conditions passed 2/2. Luna scored one point lower on average.

- Luna used 76.36% more aggregate operational Tokens than Temple Terra.
- Luna took 266.43% longer.
- Neither case gained objective correctness.

**Decision:** keep Terra medium as the default for explicit, low-risk, bounded implementation work. Luna Max should require an ambiguity, semantic-invariant, or demonstrated lower-route failure signal; it should not be selected merely because quality matters.

## C to D — Sol ceiling

Both conditions passed 2/2. Sol scored two points higher on average.

- Sol used 22.79% fewer aggregate operational Tokens than Luna.
- Sol took 14.91% less candidate time.
- Sol produced no objective correctness win because Luna already passed both cases.

**Decision:** keep Sol xhigh as a capability ceiling and collect more matched evidence. Do not promote it to a default or claim it is cheaper: the sample has only two cases, C and D are model-plus-effort bundles, effective turn reasoning effort was unavailable, and monetary price was not observed.

## What changed relative to WI-0130

WI-0130 left a return-identity invariant implicit. Its Terra candidates missed that hidden requirement while Luna inferred it, which made escalation look more valuable than it was. WI-0132 exposed identity, immutability, idempotency, compatibility, and error semantics to every candidate. All four arms then passed.

This supports a strong operational rule: **repair an incomplete contract before escalating the model.** A larger model may compensate for ambiguity, but that is an expensive and unreliable substitute for Specification and Design.

## Improvements to implement next

1. **Slim the Lean Context Capsule.** Separate a minimal task execution header from optional organization explanation. Target the 9.35 KB candidate-instruction block first, then retrieve only the context records required by the task.
2. **Make escalation evidence-driven.** Terra remains the bounded default. Recommend Luna only for explicit ambiguity or invariant risk; recommend Sol for consequential work or after a lower route produces evidence of failure.
3. **Version the analyzer semantics.** Pre-register a distinct `promising efficiency` classification for a ceiling arm that is quality-non-inferior and materially reduces both Tokens and latency. Do not retroactively change this run.
4. **Expand the case set.** Add mechanical, error-semantics, cross-file, concurrency, API-contract, and deliberately ambiguous cases. Derive the next sample size from observed variance.
5. **Separate model from effort.** When the Provider can expose effective turn effort, run matched-effort model comparisons. Until then, describe C and D as route bundles.
6. **Measure developer outcomes.** Add rework, review findings, intervention count, and elapsed delivery time. Token volume alone is not a product-value measure.

## Evidence quality and limitations

| Gate | Result |
| --- | --- |
| Eight clean isolated candidates | Pass |
| Native Lean, bounded, low-risk Temple treatment | Pass |
| Matched product inputs | Pass |
| Matched B/C/D context | Pass |
| Public and held-out acceptance tests | 8 / 8 pass |
| Blind packages frozen before mapping reveal | Pass |
| Retry, fallback, reroute, path violation | 0 |
| Effective turn reasoning effort | Unknown |
| Statistical qualification | Not attempted |
| Monetary cost | Unknown |

The two implementation cases are deliberately narrow. Their percentages describe this run, not all software work or all users of Temple.

## Retained evidence

- Canonical observation: `.ai-org/artifacts/WI-0132/live-experiment-observation.json`
- Quality interpretation: `.ai-org/artifacts/WI-0132/quality-report.md`
- Approved envelope: `.ai-org/artifacts/WI-0132/account-approval.json`
- Registered protocol: `.ai-org/artifacts/WI-0132/live-protocol.json`
- Raw evidence digest: `fdcd5d54e7dd07dee69234a5ad80ed750b52771aadaa29c9c21b1e246e5d67f7`
- Analysis digest: `4eefe732c33464c6d43189e84fa9b82e1e1369fe7087f4d055587a4958d89a68`
- Frozen score digest: `7898b6bbf0c9c376572cee48c178e5460da79999bb80fc9d09d947379f327377`

The raw lab is local and temporary. The canonical observation retains the bounded metrics, protocol audit, and source digests without raw prompts or hidden reasoning.
