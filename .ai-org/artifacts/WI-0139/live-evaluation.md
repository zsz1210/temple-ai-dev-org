# WI-0139 live evaluation

## Decision

The typed evaluator worked, but this run does **not** support a claim that stage-aware Context Capsules reduce Operational Tokens or latency.

- The coordinator multi-repository pair completed correctly in both arms. The stage-aware arm selected much less source material, but used more Operational Tokens and took longer.
- Both single-repository arms crossed the fixed 40,000 Operational Token limit, so neither result can be scored for correctness or used for an efficiency comparison.
- The result is diagnostic evidence from one matched pair per project shape. It is not statistical evidence and does not authorize automatic routing.

## Protocol and execution

| Item | Observed result |
|---|---:|
| Protocol | `ef5c9608f83fb7a70793f64d400f0c2434a8c1f1ccf8f37a7cbea9dc665ea81b` |
| Model route | requested and acknowledged `gpt-5.6-terra` / `medium` |
| Candidate turns | 4 |
| Completed / censored / stopped | 2 / 2 / 0 |
| Operational Tokens | 136,851 |
| Wall-clock time | 184.535 seconds |
| Retries / fallback | 0 / 0 |
| Credits purchase / automatic refill / reset | none |

The Provider exposed the requested and thread-configured reasoning effort, but not effective per-turn execution effort. Effective effort therefore remains unknown.

## Results

### Single repository

| Metric | Legacy expanded | Stage aware | Interpretation |
|---|---:|---:|---|
| Objective correctness | unknown | unknown | both arms were censored at the token limit |
| Selected source bytes | 40,296 | 14,592 | stage aware selected 25,704 fewer bytes (`-63.79%`) |
| Selected source count | 12 | 7 | stage aware selected 5 fewer sources |
| Operational Tokens | 40,460 | 40,084 | comparison is invalid because both crossed the limit |
| Turn latency | 31.487 s | 34.905 s | comparison is invalid because both were censored |
| Time to first activity | 4.257 s | 2.892 s | diagnostic only |
| Command actions | 5 | 6 | stage aware did not reduce repository interaction |
| Tool-output bytes | 7,415 | 7,163 | diagnostic only |

The 40,000 limit is a measured censoring boundary, not a completed-task cost. A successor protocol must set a fixed non-censoring limit above the observed 40,460 lower bound before generation; the exact margin must be declared and approved rather than adjusted during a run.

### Coordinator multi-repository

| Metric | Legacy expanded | Stage aware | Delta for stage aware |
|---|---:|---:|---:|
| Objective correctness | 7/7 facts | 7/7 facts | equivalent on this sample |
| Selected source bytes | 34,379 | 11,859 | `-65.51%` |
| Selected source count | 10 | 6 | `-40.00%` |
| Operational Tokens | 27,283 | 29,024 | `+6.38%` |
| Turn latency | 56.214 s | 60.718 s | `+8.01%` |
| Time to first activity | 3.198 s | 3.101 s | `-3.03%` |
| Command actions | 10 | 10 | no change |
| Tool-output bytes | 11,456 | 10,505 | `-8.30%` |

Both candidates recovered the exact contract, policy, four revisions, three completed slices, unresolved risk, authority owner, and safe next action. The smaller stage-aware package therefore preserved correctness in this one sample, but it did not reduce total work. The equal command count and higher uncached input indicate that smaller initial selection alone did not prevent later repository exploration.

## Token interpretation

Operational Tokens are calculated as uncached input plus output. Provider totals include cached input and must not be read as the marginal work of the condition.

| Condition | Input | Cached input | Uncached input | Output | Operational |
|---|---:|---:|---:|---:|---:|
| single stage aware | 126,256 | 86,784 | 39,472 | 612 | 40,084 |
| multi legacy expanded | 211,172 | 184,832 | 26,340 | 943 | 27,283 |
| single legacy expanded | 90,434 | 50,432 | 40,002 | 458 | 40,460 |
| multi stage aware | 208,452 | 180,736 | 27,716 | 1,308 | 29,024 |

## What this run proves

1. The repaired typed evaluator can score semantic recovery without relying on prose equality. Both completed multi-repository responses passed every typed fact.
2. Stage-aware selection substantially reduced the preselected repository material in both project shapes.
3. Reduced preselected bytes did not automatically reduce Operational Tokens, command activity, or latency.
4. The single-repository 40,000-token ceiling was too low for this task and censored both arms.

## What this run does not prove

- It does not prove that stage-aware routing is generally better or worse.
- It does not establish statistical significance, monetary savings, or a model-routing policy.
- It does not reveal effective per-turn reasoning effort.
- It does not isolate order or cache effects because each condition ran once in one fixed order.

## Recommended next changes

1. **Measure post-route exploration.** Retain a bounded, path-only read manifest so the evaluator can distinguish useful routed context from later repository expansion without retaining prompts or command output.
2. **Add a route-adherence outcome.** Compare which routed and non-routed paths were read, not only initial package size and command count. A Context Capsule should be judged on total context acquisition, not package bytes alone.
3. **Remove the single-repository censoring confounder.** Freeze a successor limit above the observed 40,460 lower bound and keep that limit identical for the matched pair.
4. **Counterbalance execution order.** Alternate which strategy runs first so cache and warm-runtime effects are not tied to one treatment.
5. **Replicate only after the harness records total context acquisition.** More runs with the current aggregate counters would add cost without explaining the multi-repository regression.

The next engineering objective should therefore be observability of context acquisition, followed by a new frozen and separately approved protocol. It should not be an immediate rerun of the same four conditions.

## Evidence boundary

Canonical machine-readable observations are in `live-observation.json` and `effectiveness-analysis.json`. Raw prompts, raw responses, hidden reasoning, credentials, and temporary repositories were not retained.
