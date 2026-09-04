# WI-0141 live Context Capsule evaluation

## Executive conclusion

The run completed all eight approved Terra-medium candidate turns in 6 minutes 39 seconds. All eight structured completions were correct. It used 197,367 Operational Tokens with zero retries and zero fallback.

The experiment does **not** support one universal Token-saving claim:

- in the single-repository fixture, stage-aware routing selected 63.79% fewer source bytes and used 32.51% fewer mean Operational Tokens, while mean latency increased by 4.45%;
- in the coordinator-led multi-repository fixture, stage-aware routing selected 65.51% fewer source bytes but used 74.90% more mean Operational Tokens, while mean latency decreased by 11.81%;
- repetition-level Token deltas varied too much to treat either mean as a stable causal estimate;
- all classifiable context reads stayed on route, but one read per turn remained unknown, so complete route adherence was not proven.

The practical result is narrower and useful: stage-aware Context Capsules preserved correctness and reduced the initial source package in both tested shapes, but package size alone does not predict total Token use. Cache behavior and task shape must remain visible, and multi-repository routing needs a separate policy from single-repository routing.

## Run integrity

| Property | Result |
|---|---:|
| Protocol | `3e51faf3bb6962d0f998003839a113a0fe789aaf22d0ad6d8b737672aff8edbd` |
| Requested/configured route | `gpt-5.6-terra`, `medium` |
| Candidate turns | 8 of 8 completed |
| Correct candidates | 8 of 8 |
| Total Operational Tokens | 197,367 |
| Total wall time | 399,307 ms |
| Retry / fallback | 0 / 0 |
| WI-0140 predecessor integrity | Passed |

The App Server acknowledged the requested model and configured reasoning effort. It did not expose effective per-turn reasoning effort, so that value remains unknown.

## Results by project shape

| Shape | Selected source bytes | Mean Operational Tokens | Mean latency | Diagnostic outcome |
|---|---:|---:|---:|---|
| Single repository | 40,296 → 14,592 (`-63.79%`) | 23,751.5 → 16,031 (`-32.51%`) | 39,200.5 → 40,944.5 ms (`+4.45%`) | Supported, with high repetition sensitivity |
| Coordinator multi-repository | 34,379 → 11,859 (`-65.51%`) | 21,426 → 37,475 (`+74.90%`) | 62,900 → 55,470 ms (`-11.81%`) | Trade-off, not neutral |

Correctness passed in both repetitions of both strategies and both project shapes. No efficiency interpretation compensates for a correctness failure.

## Repetition sensitivity

| Shape | Repetition | Operational Tokens: legacy → stage-aware | Delta | Latency: legacy → stage-aware | Delta |
|---|---|---:|---:|---:|---:|
| Single repository | A | 23,822 → 23,013 | `-3.40%` | 41,361 → 38,100 ms | `-7.88%` |
| Single repository | B | 23,681 → 9,049 | `-61.79%` | 37,040 → 43,789 ms | `+18.22%` |
| Coordinator multi-repository | A | 27,242 → 27,887 | `+2.37%` | 57,108 → 55,862 ms | `-2.18%` |
| Coordinator multi-repository | B | 15,610 → 47,063 | `+201.49%` | 68,692 → 55,078 ms | `-19.82%` |

The single-repository legacy observations differed by only 0.60%, while its stage-aware observations differed by 154.32%. Multi-repository observations differed by 74.52% for legacy and 68.76% for stage-aware. With two repetitions, these spreads are a warning about measurement sensitivity, not a variance estimate.

## Cache-aware interpretation

Across all four legacy and four stage-aware turns:

| Metric | Legacy | Stage-aware | Delta |
|---|---:|---:|---:|
| Provider input Tokens | 660,999 | 666,762 | `+0.87%` |
| Cached input Tokens | 574,464 | 563,200 | `-1.96%` |
| Operational Tokens | 90,355 | 107,012 | `+18.44%` |
| Latency | 204,201 ms | 192,829 ms | `-5.57%` |

Operational Tokens are calculated from non-cached input plus output. A modest difference in gross Provider input became a much larger Operational Token difference because cache hits differed between conditions. This run therefore demonstrates why Temple must report gross input, cached input, output, and net Operational Tokens together. It does not establish that routing strategy alone caused the net difference.

## Route-adherence evidence

The harness classified 31 context reads across the eight turns. All 31 classifiable reads were routed or otherwise policy-adherent, and none were observed off route. However, each turn also retained one unknown read, for eight unknown reads in total. Coverage is therefore incomplete.

The valid statement is: **no off-route read was observed among classifiable reads**. The invalid stronger statement would be: **every read adhered to the route**.

The repeated unknown entry appears at the control-read boundary, but raw commands and output were intentionally not retained. Its exact cause cannot be reconstructed from the privacy-bounded observation and must not be inferred as fact.

## Decision

1. Preserve stage-aware Context Capsules as an authority and context-selection mechanism; both shapes remained correct and selected materially less initial source material.
2. Do not claim universal Token savings or grant automatic routing authority from WI-0141.
3. Treat single-repository and coordinator-led multi-repository work as separate routing populations.
4. Do not run more candidate turns with the current harness. First repair the incomplete acquisition classification and cache-sensitive evaluation design.

## Required improvements before another live comparison

1. **Complete acquisition coverage.** Capture the actual safe App Server action shape that caused the repeated unknown entry, add a sanitized regression fixture, and classify the package read as `control` without retaining raw commands or content.
2. **Make cache effects first-class.** Report gross input, cached input, non-cached input, output, and Operational Tokens per turn. A future protocol should either isolate cache state or balance it across independently timed blocks when the Provider cannot disable it.
3. **Separate hypotheses.** Score route adherence, correctness, and cost as distinct outcomes. Incomplete adherence coverage must make the adherence conclusion inconclusive even when correctness and cost data are complete.
4. **Use an explicit trade-off state.** A material Token regression combined with a latency improvement must not be labelled neutral.
5. **Increase repetitions only after repairs.** The present two-repetition data identifies instability; it does not justify spending on a larger run until measurement coverage and cache control are improved.

## Evidence

- `.ai-org/artifacts/WI-0141/live-protocol.json`
- `.ai-org/artifacts/WI-0141/account-approval.json`
- `.ai-org/artifacts/WI-0141/approved-preflight.json`
- `.ai-org/artifacts/WI-0141/live-observation.json`
- `.ai-org/artifacts/WI-0141/effectiveness-analysis.json`
- `.ai-org/artifacts/WI-0141/effectiveness-report.md`
