# WI-0143 Context Capsule route-adherence effectiveness report

- Protocol: `084e7ac3ae67c1c4a093fe832cd23728d03c440ddeca95a74fbf45bbb062536b`
- Candidate turns: 8 of 8 retained
- Retry: 0; fallback: 0
- Human intervention during run: 0; rework turns: 0
- Analysis status: `complete`

## Results by project shape

| Shape | Correctness (legacy / stage-aware) | Source bytes delta | Operational Tokens delta | Latency delta | Route evidence | Diagnostic outcome | Causal efficiency |
|---|---:|---:|---:|---:|---|---|---|
| single-repository | true / true | -63.79% | -13.28% | -16.27% | no-off-route-observed-with-complete-coverage; unknown reads 0 / 0 | supported | blocked |
| coordinator-multi-repository | true / true | -65.51% | 31.01% | 1.7% | no-off-route-observed-with-complete-coverage; unknown reads 0 / 0 | overhead-regression | blocked |

## Repetition and cache detail

| Shape | Repetition | Operational Tokens (legacy / stage-aware) | Token delta | Latency ms (legacy / stage-aware) | Latency delta | Cache share % (legacy / stage-aware) |
|---|---|---:|---:|---:|---:|---:|
| single-repository | a | 27020 / 23084 | -14.57% | 43809 / 35907 | -18.04% | 79.93 / 82.24 |
| single-repository | b | 27459 / 24161 | -12.01% | 43825 / 37473 | -14.49% | 82.72 / 81.69 |
| coordinator-multi-repository | a | 29563 / 28357 | -4.08% | 63245 / 62875 | -0.59% | 86.8 / 87.06 |
| coordinator-multi-repository | b | 27282 / 46114 | 69.03% | 55053 / 57429 | 4.32% | 87.48 / 76.33 |

## Provider usage and cache control

| Shape | Gross input (legacy / stage-aware) | Cached input | Non-cached input | Output | Cache share % | Cache-control validity |
|---|---:|---:|---:|---:|---:|---|
| single-repository | 141920 / 126810 | 115584 / 103936 | 26336 / 22874 | 903.5 / 748.5 | 81.33 / 81.97 | failed (matched-cache-share) |
| coordinator-multi-repository | 211529 / 198963 | 184320 / 163072 | 27209 / 35891 | 1213.5 / 1344.5 | 87.14 / 81.69 | failed (matched-cache-share) |

## Interpretation limits

Correctness is evaluated from canonical typed facts and gates every efficiency interpretation. Initial source bytes, bounded post-route acquisition, Provider Tokens, latency, and tool-output bytes are separate measurements. Two counterbalanced repetitions per condition remain diagnostic evidence and do not establish statistical, monetary, or automatic-routing claims.

This analyzer keeps unknown acquisition records fail-closed. A successor sanitized regression recognizes exact single-file control-package reads, but the sealed historical observation is not rewritten and its unknown records are not retroactively relabelled.

Gross input, cached input, non-cached input, output, Operational Tokens, and cache share are reported together. Causal efficiency is eligible only when every matched pair satisfies the frozen 2-percentage-point cache-share tolerance and both treatments pass correctness.

The route is described as requested-and-thread-configured Terra medium. The installed App Server does not expose per-turn execution-effort telemetry, so effective execution effort remains unknown rather than inferred.

Raw commands, command output content, prompts, responses, hidden reasoning, credentials, and temporary repositories were not retained in Git.
