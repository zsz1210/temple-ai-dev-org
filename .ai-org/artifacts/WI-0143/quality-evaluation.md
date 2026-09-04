# WI-0143 quality evaluation

## Evaluation decision

The approved experiment completed successfully as a measurement, but it does not establish a causal efficiency claim. All eight candidates completed, all objective answers were correct, acquisition coverage was complete, and no unknown or off-route reads were observed. The frozen cache-control rule failed in one matched pair for each project shape, so the analyzer correctly blocked causal attribution.

## Result by project shape

| Shape | Quality | Routed source bytes | Operational Tokens | Latency | Cache-control result | Interpretation |
|---|---|---:|---:|---:|---|---|
| Single repository | Both treatments passed twice | 63.79% lower | 13.28% lower | 16.27% lower | Failed narrowly: maximum 2.31 points vs 2-point limit | Promising and repetition-consistent, but descriptive only |
| Multi repository | Both treatments passed twice | 65.51% lower | 31.01% higher | 1.70% higher | Failed materially: maximum 11.15 points | Unstable and not suitable for an efficiency claim |

The single-repository Operational Token result was directionally consistent in both repetitions: Routed Context used 14.57% and 12.01% fewer Operational Tokens. Its latency was also 18.04% and 14.49% lower. Nevertheless, repetition A exceeded the cache-share limit by 0.31 percentage points, so the predeclared rule must stand.

The multi-repository result changed direction across repetitions: Routed Context used 4.08% fewer Operational Tokens in repetition A and 69.03% more in repetition B. Repetition B also had an 11.15-point cache-share mismatch. The 31.01% mean overhead therefore cannot be attributed to Routed Context.

## Aggregate boundary

- Total observed Operational Tokens: 233,040 of the approved 524,000 ceiling.
- Runtime: 401,945 ms, approximately 6 minutes 42 seconds, within the 80-minute ceiling.
- Retry, fallback, human intervention, and rework: all zero.
- Gross Provider input was 7.83% lower for Routed Context, but cached input was 10.97% lower and non-cached input was 9.75% higher. This divergence is precisely why gross input, cached input, and Operational Tokens cannot be collapsed into one savings claim.
- The account-level Pro percentage is not attributable to this Work Item and is not converted into cost.

## What this validates

1. Routed Context can preserve exact recovery quality while selecting 64% to 66% fewer repository-source bytes.
2. The acquisition measurement repair worked: coverage was complete, with zero unknown and zero off-route reads.
3. Adjacent execution reduced cache mismatch in two pairs but did not control it reliably across all four pairs.
4. The fail-closed cache gate worked and prevented a misleading aggregate claim.
5. A single universal routing-efficiency statement is not supported. Single-repository and multi-repository task shapes must remain separate.

## Recommended improvement

Do not relax the two-point threshold after seeing this result. Preserve WI-0143 as the diagnostic baseline. For a successor experiment:

1. keep the single-repository result as promising evidence, not automatic routing authority;
2. redesign the multi-repository comparison around more randomized matched blocks or an acknowledged Provider cache-control mechanism if one becomes available;
3. retain source bytes, gross input, cache share, non-cached input, output, and latency as separate outcomes;
4. predeclare enough repetitions from observed variance before spending, rather than choosing a sample count after the next result;
5. compare models only after the process/cache question is adequately controlled, so model and context effects are not confounded.

No follow-on run, threshold change, routing-policy change, or new Work Item is authorized by this evaluation.
