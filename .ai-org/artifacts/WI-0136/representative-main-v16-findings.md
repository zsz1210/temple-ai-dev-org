# WI-0136 representative microservice comparison findings

## Executive finding

The controlled pair completed successfully, but it does not show a clear overall winner.

Both the Minimal Responsible and Temple arms passed every public and held-out test, recovered all four exact repository revisions and all three implementation slices, received the same arm-blind score of 8/8, and recorded no boundary violation, rework action, or human workflow intervention.

Temple used 6,458 fewer Operational Tokens and 14.016 seconds less measured model latency in this run. That advantage came with a 31.765-second slower integration stage, 319,046 more gross Tokens, and 2,369,518 more artifact bytes. These are observed trade-offs from one matched scenario, not evidence of a stable savings rate or general superiority.

## Observed comparison

| Measure | Minimal Responsible | Temple | Temple difference |
|---|---:|---:|---:|
| Objective tests | pass | pass | no difference |
| Arm-blind score | 8/8 | 8/8 | no difference |
| Exact revisions recovered | 4/4 | 4/4 | no difference |
| Completed slices recovered | 3/3 | 3/3 | no difference |
| Boundary violations | 0 | 0 | no difference |
| Rework actions | 0 | 0 | no difference |
| Human workflow interventions | 0 | 0 | no difference |
| Operational Tokens | 183,854 | 177,396 | -6,458 (-3.51%) |
| Gross Tokens | 2,136,110 | 2,455,156 | +319,046 (+14.94%) |
| Measured model latency | 515.217 s | 501.201 s | -14.016 s (-2.72%) |
| Integration Operational Tokens | 57,806 | 56,440 | -1,366 (-2.36%) |
| Integration latency | 169.823 s | 201.588 s | +31.765 s (+18.70%) |
| Changed lines | 56 | 58 | +2 (+3.57%) |
| Artifact footprint | 222,982 bytes | 2,592,500 bytes | +2,369,518 bytes (+1062.65%) |

Operational Tokens are uncached input plus output Tokens. Gross Tokens include cached input and therefore describe context volume, not a monetary charge. The repository has no authoritative price source for converting either measure to cost.

## Evaluator integrity and overhead

The Sol evaluator scored anonymous packages before the arm mapping was unsealed. Both packages received 8/8 and no critical failure. The evaluator used 20,860 additional Operational Tokens and completed in 37.693 seconds. Candidate and evaluator usage together was 382,110 Operational Tokens.

The run used zero retries and zero fallbacks. It recorded one user message, three reasoning items, one agent message, and no tool activity. The acknowledged model was `gpt-5.6-sol`.

The exact turn request specified `xhigh`, and preflight validated that request against the installed Provider schema. The Provider exposed the thread-level setting as `high` and did not expose an effective turn-level reasoning value. The report must therefore describe `xhigh` as the requested route, not as independently observed effective reasoning.

## What this result supports

- Temple preserved correctness, exact recovery, boundaries, and safe next-action quality in this four-repository change.
- Temple did not require more Operational Tokens or measured model latency in this particular pair.
- The baseline was competent, so the equality in correctness is meaningful and not manufactured by comparing Temple with a negligent workflow.
- The systemic runner repair was effective for the event shapes exercised by this run: the evaluator completed, usage was retained, scores froze before mapping unseal, and no forbidden tool event occurred.

## What this result does not support

- It does not show that Temple improves correctness over a competent minimal workflow; both arms reached the rubric ceiling.
- It does not establish Token or latency savings outside this single run.
- It does not establish monetary savings or automatic model-routing authority.
- It does not show Temple's value under the conditions most likely to stress organization: conflicting concurrent edits, interrupted handoffs, changing requirements, failed QA, or multiple human maintainers.

## Improvement priorities suggested by the evidence

1. **Reduce durable-state overhead.** Temple's artifact footprint was about 11.6 times the baseline. Separate essential canonical evidence from regenerable projections, measure both categories independently, and set retention guidance.
2. **Explain gross versus Operational Token divergence.** Temple moved less uncached context but more total context. Future reports should show cached input by stage so context reuse is visible without implying cost.
3. **Investigate integration latency.** Temple's integration used slightly fewer Operational Tokens but took 18.70% longer. Stage traces should distinguish model time, repository inspection, CLI governance, and coordination overhead.
4. **Avoid rubric ceiling effects.** The next matched scenario should preserve the competent baseline while introducing one controlled coordination stressor, such as a cross-repository conflict or interrupted handoff.
5. **Close reasoning-effort observability.** Record effective turn effort when the Provider exposes it; otherwise keep requested, thread-observed, and effective values visibly separate.

## Interpretation boundary

This is one controlled matched pair. The result is descriptive and mixed: equal quality and correctness, modestly lower Temple Operational Tokens and measured model latency, slower Temple integration, and substantially larger Temple artifact storage. More independent matched scenarios are required before changing policy, claiming savings, or recommending automatic routing.

