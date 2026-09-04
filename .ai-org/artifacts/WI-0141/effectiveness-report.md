# WI-0141 Context Capsule route-adherence effectiveness report

- Protocol: `3e51faf3bb6962d0f998003839a113a0fe789aaf22d0ad6d8b737672aff8edbd`
- Candidate turns: 8 of 8 retained
- Retry: 0; fallback: 0
- Analysis status: `complete`

## Results by project shape

| Shape | Correctness (legacy / stage-aware) | Source bytes (legacy / stage-aware) | Known adherence (legacy / stage-aware) | Off-route reads (legacy / stage-aware) | Operational Tokens delta | Latency delta | Outcome |
|---|---:|---:|---:|---:|---:|---:|---|
| single-repository | true / true | 40296 / 14592 | 100% / 100% | 0 / 0 | -32.51% | 4.45% | supported |
| coordinator-multi-repository | true / true | 34379 / 11859 | 100% / 100% | 0 / 0 | 74.9% | -11.81% | neutral |

## Interpretation

Correctness is evaluated from canonical typed facts and gates every efficiency interpretation. Initial source bytes, bounded post-route acquisition, Provider Tokens, latency, and tool-output bytes are separate measurements. Two counterbalanced repetitions per condition remain diagnostic evidence and do not establish statistical, monetary, or automatic-routing claims.

The route is described as requested-and-thread-configured Terra medium. The installed App Server does not expose per-turn execution-effort telemetry, so effective execution effort remains unknown rather than inferred.

Raw commands, command output content, prompts, responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.
