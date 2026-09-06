# Full versus Model: completed four-delivery comparison

## Outcome

All eight authorized stages completed: four Builders and four fresh Verifiers.
All four deliveries passed product tests, the hidden oracle, exact-candidate
handoff and lifecycle checks. The run and evidence manifest passed seal verification.
There were no rejected commands, experiment retries, fallbacks, resets, purchases,
refills or extra model judges. This is an actual completed comparison, not readiness only.

In this sample, Model used **8.48% fewer Operational Tokens** and **4.47% less
actor elapsed time** than Full. Both formats completed 2/2 deliveries. This is a
small descriptive result, not evidence of general superiority or routing authority.

## What was compared

The same shipping-quote implementation task and acceptance contract ran in four
fresh isolated repositories, ordered Full → Model → Model → Full. Each delivery
used a Builder followed by a fresh Verifier. Both formats used Temple; this is
**not Temple versus unassisted/default Codex** and not a model-routing comparison.

The requested and acknowledged model was `gpt-5.6-terra`, with requested and
thread-observed reasoning `medium`. Effective turn effort was not exposed.
The intervention was context representation, not permission to omit required
source bodies. Offline probes confirmed equivalent task material and required
read/reuse behavior. Source revision was frozen throughout generation.

## Complete deliveries

| Order | Format | Builder Tokens | Verifier Tokens | Total Operational Tokens | Actor seconds | Final checks |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | Full | 56,701 | 56,190 | 112,891 | 250.566 | Pass |
| 2 | Model | 65,994 | 42,007 | 108,001 | 247.779 | Pass |
| 3 | Model | 56,878 | 50,595 | 107,473 | 236.533 | Pass |
| 4 | Full | 68,286 | 54,254 | 122,540 | 256.402 | Pass |

| Per-delivery average | Full | Model | Model versus Full |
| --- | ---: | ---: | ---: |
| Operational Tokens | 117,715.5 | 107,737 | -8.48% |
| Actor seconds, Build + Verify | 253.484 | 242.156 | -4.47% |
| Final accepted deliveries | 2/2 | 2/2 | Same observed outcome |

The first adjacent pair favors Model by 4.33% Tokens and 1.11% time; the reverse
pair favors Model by 12.30% Tokens and 7.75% time. The substantial difference
between those two estimates is a reason not to promise an exact saving.

The aggregate run used **450,905 Operational Tokens** over **993,323 ms
(16.56 minutes)**. Actor times total 991,280 ms; the remaining time is harness
overhead. The limits were 640,000 aggregate Operational Tokens / 48 minutes,
six minutes per stage, and an 80,000-Token stage warning. No stage reached that
warning, so the live warning path remains unexercised by this sample.

## Quality and rework

Final success was equal, but first-pass development was not:

- Full Builders observed test exit sequences `[0]` and `[0]`.
- Model Builders observed `[1, 0]` and `[1, 1, 0]`.
- All four Verifiers observed `[0]`; all final hidden-oracle exits were zero.

Those three failing test invocations are included in Model's measured cost.
They are within-stage development corrections, not fresh experiment retries.
The aggregate record does not by itself establish whether each failure came
from an implementation error, a newly written test error or another cause.
No claim that Model caused the rework is justified from two Builders.

Model completed 61 commands versus Full's 58. Thus the observed saving did not
come from fewer commands, and a smaller context response does not necessarily
mean less development work. Final quality checks cover this fixture's contract,
not general production correctness or security.

## Token accounting and interpretation

| Aggregate across two deliveries | Full | Model |
| --- | ---: | ---: |
| Input Tokens | 2,692,662 | 2,621,803 |
| Cached input Tokens | 2,473,728 | 2,421,504 |
| Non-cached input Tokens | 218,934 | 200,299 |
| Output Tokens | 16,497 | 15,175 |
| Total input + output Tokens | 2,709,159 | 2,636,978 |
| Operational Tokens | 235,431 | 215,474 |

Operational Tokens = input minus cached input plus output. They are not a price
or a claim that cached Tokens are free. Total Tokens fell by about 2.66%, while
Operational Tokens fell by 8.48%. Cache was uncontrolled; provider usage is the
last observed stage total, not account-final billing evidence. Token attribution
to individual commands is unavailable. Actor elapsed time is not decoding speed.

The Builder context-entry response was 84,529 bytes for Full and 79,542 bytes for
Model (5.90% smaller). Verifier responses also differed with candidate state.
This confirms a smaller representation; it does not isolate how much of the
end-to-end difference arose from formatting, caching, generated code or rework.

## Relation to previous runs

[WI-0217](../WI-0217/result-report.md) stopped on an undifferentiated
`argument-shape` rejection; its one complete pair showed -8.78% Operational
Tokens and -0.64% time. That direction is consistent with this sample, but the
earlier incomplete run must not be pooled as though its missing deliveries passed.

This source added bounded diagnostic subcodes and tested actual generated entry
commands against the installed CLI. All eight live entries passed here. The old
failure did not recur, but its raw arguments were not retained, so this run does
not prove a root-cause fix. No guard was relaxed and no speculative wrapper was
introduced. Earlier sealed laboratories remain unchanged.

## Recommended next decision

1. Keep Model available as an opt-in format; retain Full as the existing default.
   The modest sample supports compatibility and a promising efficiency signal,
   not a default change or a universal Temple efficiency claim.
2. Prefer a bounded analysis of the existing Model test corrections and repeated
   source reads before another paid comparison. Distinguish necessary verifier
   review from redundant reads; do not remove authority or acceptance material.
3. If a wider experiment is later approved, vary task family and complexity,
   keep fresh sessions and both orders, report cache and all failed attempts,
   and define the practical quality/time/Token decision criteria beforehand.
   No additional experiment is launched by this report.

The authorized live scope is complete. The Work Item advances to evaluation;
formal Independent QA, merge and release are separate decisions.

## Evidence

- Execution owner: WI-0220; instrument identity: WI-0216 v2.
- Source: `2aef01bd0ff943ffb54c2462f41b7efcab42326c`.
- Protocol: `sha256:307917e227bc91147bf3d56530706f74a1039c53b379099ba43f856b49d380b7`.
- Sealed run: `sha256:7c5cea62d6f7d7a79aef3ce4d2342a7b30306b9358975fe0c494460d7fed71e6`.
- Manifest: `sha256:4e4417703779643bbf9f86e01884667321607f9d60913e7bd2b4cfdc50958cd2`.
- [Stage measurements](measurements.json), [approval](../WI-0216/wi0220-approval.json),
  [independent readiness](../WI-0216/wi0220-readiness.md),
  [local compatibility verification](../WI-0219/verification.md).

The source's 666-test full suite and readiness checks are software checks, not
additional live samples. Raw prompts, hidden reasoning, local host paths, raw
thread identifiers and command arguments are excluded from this report.

Post-run `npm run verify` also passed: 666/666 tests, no failures, skips or
cancellations (159,332 ms). Doctor passed 37 checks with zero warnings or failures
after refreshing the existing parent plan. `git diff --check` passed. These
checks validate repository consistency; they do not add statistical samples.
