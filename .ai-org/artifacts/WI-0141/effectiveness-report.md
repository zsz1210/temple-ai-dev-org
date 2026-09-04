# WI-0141 Context Capsule route-adherence effectiveness report

- Protocol: `3e51faf3bb6962d0f998003839a113a0fe789aaf22d0ad6d8b737672aff8edbd`
- Candidate turns: 8 of 8 retained
- Retry: 0; fallback: 0
- Analysis status: `complete`

## Results by project shape

| Shape | Correctness (legacy / stage-aware) | Source bytes delta | Operational Tokens delta | Latency delta | Route evidence | Efficiency outcome |
|---|---:|---:|---:|---:|---|---|
| single-repository | true / true | -63.79% | -32.51% | 4.45% | inconclusive-incomplete-coverage; unknown reads 2 / 2 | supported |
| coordinator-multi-repository | true / true | -65.51% | 74.9% | -11.81% | inconclusive-incomplete-coverage; unknown reads 2 / 2 | tradeoff |

## Repetition and cache detail

| Shape | Repetition | Operational Tokens (legacy / stage-aware) | Token delta | Latency ms (legacy / stage-aware) | Latency delta | Cache share % (legacy / stage-aware) |
|---|---|---:|---:|---:|---:|---:|
| single-repository | a | 23822 / 23013 | -3.4% | 41361 / 38100 | -7.88% | 82.36 / 82.26 |
| single-repository | b | 23681 / 9049 | -61.79% | 37040 / 43789 | 18.22% | 82.15 / 93.57 |
| coordinator-multi-repository | a | 27242 / 27887 | 2.37% | 57108 / 55862 | -2.18% | 87.48 / 86.98 |
| coordinator-multi-repository | b | 15610 / 47063 | 201.49% | 68692 / 55078 | -19.82% | 92.55 / 77.69 |

## Interpretation limits

Correctness is evaluated from canonical typed facts and gates every efficiency interpretation. Initial source bytes, bounded post-route acquisition, Provider Tokens, latency, and tool-output bytes are separate measurements. Two counterbalanced repetitions per condition remain diagnostic evidence and do not establish statistical, monetary, or automatic-routing claims.

Known classifiable reads showed no off-route access, but every live condition retained one unknown read. Coverage is therefore incomplete and this run does not prove full route adherence. Repetition-level Operational Token and cache-share values are shown because cache variation can dominate the net Operational Token calculation; averages alone are not a stable causal estimate.

The route is described as requested-and-thread-configured Terra medium. The installed App Server does not expose per-turn execution-effort telemetry, so effective execution effort remains unknown rather than inferred.

Raw commands, command output content, prompts, responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.
