# WI-0138 Context Capsule v2 effectiveness report

- Protocol: `45717b859f2f88a4dd182d4bb7c7968839eb154e0f3ad9671e4d53e3986ad382`
- Candidate turns: 4 of 4 retained
- Retry: 0; fallback: 0
- Analysis status: `complete`

## Results by project shape

| Shape | Correctness (legacy / stage-aware) | Source bytes (legacy / stage-aware) | Operational Tokens delta | Latency delta | Outcome |
|---|---:|---:|---:|---:|---|
| single-repository | false / false | 40093 / 14389 | -3.47% | 9.83% | inconclusive |
| coordinator-multi-repository | false / false | 34164 / 11644 | 3.58% | -2.82% | inconclusive |

## Interpretation

Correctness gates every efficiency interpretation. Repository source bytes, Provider Tokens, latency, and tool-output bytes are separate measurements. One matched pair per shape is diagnostic evidence only and does not establish statistical, monetary, or automatic-routing claims.

Raw prompts, raw responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.
