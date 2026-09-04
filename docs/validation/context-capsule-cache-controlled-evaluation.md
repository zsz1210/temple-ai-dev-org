# Cache-controlled Context Capsule evaluation

WI-0143 is the live successor to the WI-0141 Context Capsule comparison. It tests whether Routed Context changes delivery behavior relative to Full-load Context without changing the model, reasoning effort, fixtures, tools, output schema, or quality rubric.

## Why another run is necessary

WI-0141 showed that the two context strategies selected different amounts of repository evidence, and it produced useful quality, Token, latency, and acquisition observations. It could not support a routing-only efficiency claim because the protocol did not predeclare a cache-control method. The repetition-a pair differences in cache share were 0.10 percentage points for the single-repository task and 0.50 for the multi-repository task, while the later repetition-b differences grew to 11.42 and 14.86 points. That time-dependent variation can dominate non-cached input and Operational Tokens.

WI-0143 repairs the design before observing new results. It does not reinterpret the old run.

## Frozen design

| Factor | WI-0143 control |
|---|---|
| Experimental factor | Context strategy only: Full-load Context versus Routed Context |
| Model | `gpt-5.6-terra` for every condition |
| Reasoning | `medium` for every condition |
| Task shapes | One single-repository recovery task and one four-repository coordination task |
| Repetitions | Two per treatment and shape; eight candidate turns total |
| Pairing | Same shape and repetition, run adjacently |
| Order | Treatment that leads the pair alternates across four blocks |
| Cache method | Predeclared matched cache share |
| Cache tolerance | At most 2 percentage points within every matched pair |
| Quality | Exact typed-fact correctness is primary |
| Retry / fallback | Zero / zero |
| Evaluator turns | Zero; objective fixture-owned rubric only |

The two-point cache tolerance is a diagnostic engineering rule. It is based on the retained near-pair pilot maximum of 0.50 points with a fourfold rounded margin. It is not a confidence interval, a universal Provider property, or statistical proof. If even one matched pair exceeds the limit, the report keeps the measurements but blocks a causal efficiency claim.

## Measurements

For every condition, retain:

- objective correctness and typed-field failures;
- gross input, cached input, non-cached input, output, and Operational Tokens;
- turn latency and time to first activity;
- bounded context-acquisition classifications and output-byte counts;
- requested and acknowledged model configuration;
- retry, fallback, human-intervention, and rework counts.

The derived measures are:

```text
non-cached input = gross input - cached input
Operational Tokens = non-cached input + output
cache share = cached input / gross input
```

Token values are Provider telemetry and an experiment budget unit. They are not a bill or a Credits conversion.

## Generation-free preparation

The harness is reusable only for explicitly supported experiment profiles. WI-0141 remains its sealed default. WI-0143 must be selected explicitly:

```sh
node scripts/run-context-capsule-ablation.mjs prepare --work-item WI-0143
node scripts/run-context-capsule-ablation.mjs rehearse --work-item WI-0143
node scripts/run-context-capsule-ablation.mjs preflight --work-item WI-0143
```

These commands may inspect the installed Codex App Server contract but do not submit a model turn. Before approval, the only acceptable preflight blocker is `exact-approval`.

The live command is deliberately separate:

```sh
node scripts/run-context-capsule-ablation.mjs run --work-item WI-0143
```

It remains blocked unless `.ai-org/artifacts/WI-0143/account-approval.json` exactly matches the frozen protocol digest, conditions, model, reasoning effort, Token limits, time limit, cache-control record, Pro-only boundary, and zero-retry/fallback policy.

## Interpretation

Evaluate in this order:

1. Did all eight conditions complete without retry, fallback, or in-run human intervention?
2. Did both treatments pass objective correctness in both shapes?
3. Was acquisition coverage complete, and were off-route reads absent?
4. Did every matched pair satisfy the cache-share limit?
5. Only then compare non-cached input, output, Operational Tokens, and latency.

Report each project shape separately. A favorable aggregate cannot hide a quality regression, cache-control failure, or opposing per-shape result. One bounded run can justify the next engineering decision; it cannot establish a universal Temple or model-routing claim.
