# B/C ordinary-versus-Temple measurement

The new v8 matrix completed all **8/8 fresh actor stages** on 2026-09-06. All products passed the public/added tests, held-out contract oracle and fresh exact-candidate verification. Both Temple arms also passed observed eligible entry and current successful finish checks. No additional actor retry, fallback, purchase or reset occurred.

## Result

Each row combines one Builder and one fresh Verifier per arm. Requested and acknowledged model IDs match; requested and observed thread reasoning effort was medium. Effective turn effort and immutable model release remain unobserved. Provider: codex-cli 0.153.1. This is one paired observation per model, not a reliability estimate or model ranking.

| Model / effort | Ordinary operational Tokens | Temple operational Tokens | Temple change | Ordinary stage time | Temple stage time | Temple change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gpt-5.6-terra / medium | 67,959 | 124,939 | +83.84% | 219.111 s | 277.991 s | +26.87% |
| gpt-6-astra / medium | 95,006 | 118,095 | +24.30% | 237.992 s | 309.208 s | +29.92% |

Operational Tokens are non-cached input plus output, not total Tokens, monetary cost or account-final usage. Matrix elapsed time including orchestration was 1,046.581 seconds; observed operational usage was 405,999 of the 640,000 limit. Every stage remained within its 80,000 Token and six-minute ceiling. Aggregate elapsed remained within 48 minutes. Coordinator/reviewer inference and harness development are excluded from the actor comparison.

For this clear small-feature task, Temple added cost without an observed acceptance benefit. The passing B/C product tests and reduced administrative calls do not establish an end-to-end efficiency win. The earlier v7 comparison is historical context, not a simultaneous B/C causal control; this run does not establish whether B/C improved or worsened costs relative to v7.

## Where to investigate next

| Model | Ordinary / Temple command completions | Ordinary / Temple full product-test commands | Ordinary / Temple context-and-exploration output bytes |
| --- | ---: | ---: | ---: |
| Terra | 22 / 29 | 4 / 4 | 12,238 / 317,461 |
| GPT-6 Astra | 21 / 30 | 5 / 5 | 14,309 / 332,954 |

Every Temple stage made one eligible entry and one successful current finish. The dedicated finish operation avoids separate repeated Status/Doctor calls in these observed runs. In contrast, entry alone returned approximately 95-103 KB per stage, alongside mandatory cold instruction and other reads. That is a concrete output-volume finding, not proof of how many inference Tokens any source caused. Fewer commands did not make entry material small.

Product-test invocation counts were equal within each model, so this run does not support blaming additional full product-test invocations for the cost difference. Command counts increased moderately, while observed context/read output increased substantially. The recommended next design target is entry material composition and duplicate whole-source delivery, while preserving required instructions, current authority and complete evidence. A source-by-source payload audit and controlled ablation would be needed for causal attribution; neither is silently added to this run.

## Measurement limits

- Context/read output includes framework and product/evidence reads; raw provider output bytes are not guaranteed model-visible input bytes or per-operation Token attribution.
- Per-category elapsed values measure notification arrival intervals. Some buffered start/completion notifications arrive almost together, so these values are not reliable subprocess execution durations. Do not use them to estimate the time share of a category or subtract them to derive model thinking time. Per-stage wall time remains the reported elapsed outcome.
- Patch activity includes product and evidence edits. A repeated command hash does not prove redundant work at an unchanged state. Missing output remains incomplete, not established zero.
- Cache was observed but uncontrolled. Terra was ordinary-first; Astra Temple-first. Different models cannot compensate for the absence of within-model order counterbalancing. No statistical claim is made.
- This protocol retains required cold instruction loading. It does not test requirement changes, recovery from interruption, shared-writer conflicts, high-risk delivery or organization-scale maintenance.

## Verification and provenance

Instrument candidate: eb6315cec0fa2b16ba18e26656ade9a08dc7fd55. Temple core behavior: accepted B/C base 7c9c1b88b96b8d334c5c0a88bd287f473ce4fc42. Source digest: sha256:c4c7e1192717dd0780d6a1bb0d070532e4e3718403f71558376ce93e757f3ff2. Matrix digest: sha256:08741a5f4cf443986a61b0840db42dba212f4570f30c2dadc5b7c349826f164d.

Full instrument verification passed 632/632, zero failures/skips; installed sandbox readiness passed four synthetic stages and two denied boundary writes. Distinct-Identity readiness QA passed the corrected candidate. The earlier failed verification and BLOCKED review are preserved, not erased. That QA is instrument readiness, not an independently authored live-results review.

The read-only analyze.mjs verified each retained run and artifact seal, matched matrix/source/protocol/approval bindings, and recalculated operation and cost categories from completed events. A separate Python arithmetic reconstruction matched every arm's Tokens and stage time, every category's completed-event count and the 405,999 matrix total. No model was called for reconciliation. Detailed bounded results are in results.json; authorization and sandbox records accompany this report. Private original labs are retained separately and were never modified after sealing.

Measurement is complete. Retain results and stop; no additional trial, framework change, merge or publication follows from this result.
