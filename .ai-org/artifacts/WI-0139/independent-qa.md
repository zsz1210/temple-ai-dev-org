# WI-0139 independent QA

## Decision

Pass the WI-0139 evaluator repair and retain the live treatment result as inconclusive evidence.

The repaired evaluator produced reproducible typed analysis. The live run obeyed the exact approved protocol, and the report does not turn censored or regressive observations into an efficiency claim. This decision accepts the measurement repair; it does not approve stage-aware Context Capsules as a better default.

## Independent checks

| Check | Result |
|---|---|
| Live analysis reproduces byte-for-byte when the recorded timestamp is held constant | Pass |
| Completed multi-repository conditions satisfy all 7 typed facts | Pass |
| Censored single-repository conditions retain null completion and correctness | Pass |
| Total Operational Tokens equal the four retained condition totals | Pass: 136,851 |
| Protocol digest matches approval, preflight, observation, and analysis | Pass |
| Requested and acknowledged route remains Terra / medium | Pass |
| Retry and fallback remain zero | Pass |
| Raw prompts, raw responses, hidden reasoning, credentials, and temporary repositories are absent | Pass |
| Focused Context Capsule evaluator tests | Pass: 6/6 |
| Full repository verification | Pass: 406/406 |

## Counterexample review

- The multi-repository result is a counterexample to the claim that a smaller initial package necessarily lowers total context cost: selected source bytes fell 65.51%, while Operational Tokens rose 6.38% and latency rose 8.01%.
- The single-repository pair cannot be used as supporting or opposing evidence because both conditions crossed the declared 40,000-token ceiling.
- Equal multi-repository command counts show that package-size reduction did not reduce repository interaction in this sample.
- One observation per condition is insufficient for statistical, monetary, or automatic-routing conclusions.

## Independence

The Developer Assignment is Rikku (`agent-rikku`). Independent QA is Lulu (`agent-lulu`). They are distinct Agent Identities.

## Remaining work

The next experiment must record bounded path-only post-route acquisition, add route-adherence scoring, remove the observed single-repository censoring confounder in a newly frozen protocol, and counterbalance condition order. It requires separate authorization before any Provider generation.
