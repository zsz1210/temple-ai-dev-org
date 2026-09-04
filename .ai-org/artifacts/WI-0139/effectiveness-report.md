# WI-0139 typed Context Capsule effectiveness report

- Protocol: `ef5c9608f83fb7a70793f64d400f0c2434a8c1f1ccf8f37a7cbea9dc665ea81b`
- Candidate turns: 4 of 4 retained
- Retry: 0; fallback: 0
- Analysis status: `inconclusive`

## Results by project shape

| Shape | Correctness (legacy / stage-aware) | Source bytes (legacy / stage-aware) | Operational Tokens delta | Latency delta | Outcome |
|---|---:|---:|---:|---:|---|
| single-repository | unknown / unknown | 40296 / 14592 | unknown | unknown | inconclusive |
| coordinator-multi-repository | true / true | 34379 / 11859 | 6.38% | 8.01% | overhead-regression |

## Interpretation

Correctness is evaluated from canonical typed facts and gates every efficiency interpretation. Repository source bytes, Provider Tokens, latency, and tool-output bytes are separate measurements. One matched pair per shape is diagnostic evidence only and does not establish statistical, monetary, or automatic-routing claims.

The route is described as requested-and-thread-configured Terra medium. The installed App Server does not expose per-turn execution-effort telemetry, so effective execution effort remains unknown rather than inferred.

Raw prompts, raw responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.
