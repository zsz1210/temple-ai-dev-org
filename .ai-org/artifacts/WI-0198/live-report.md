# WI-0198 native child compatibility probe

## Outcome

The one approved live arm stopped without retry. It did not establish native child-observation compatibility.

The parent completed and reported that its native informational-helper dispatch failed before a helper was created. The machine-retained evidence does not independently classify that failure: it records no native error and no first-failure category. It directly establishes that zero children were observed where the sealed protocol required exactly one, producing the named symptom `native-helper-unobserved`.

Cleanup was observed terminal. The final fixture snapshot contained no changed or out-of-scope paths; the evidence does not prove that transient writes were absent during execution.

## Observed measurements

- Model and effort: `gpt-5.6-terra`, `medium`
- One planned and one recorded arm
- Wall time: 46,628 ms overall; 46,528 ms for the subject
- Parent: completed, three tool calls
- Children: zero observed; one required
- Parent Operational Tokens: 33,472
- Parent total Tokens: 129,728, including 96,256 cached input Tokens
- Quality: unmeasurable because the Provider operation was incomplete
- Retry, fallback, reset, Credit purchase, and automatic top-up: none

The Token observation is per-thread last-observed telemetry, not account-final billing. The conservative counter is not a price or an efficiency measurement.

## Interpretation

The WI-0196 two-phase acquisition logic was not exercised because no candidate child identity appeared. The observed symptom occurred before acquisition, rather than during child binding or buffered-event replay. The evidence does not establish whether dispatch was attempted, rejected, unavailable, or simply not observable.

The retained privacy boundary does not include raw tool failure output. Runtime capacity, Provider support, request semantics, tool availability, and other pre-acquisition conditions therefore remain possibilities rather than findings.

This result is useful but not a successful compatibility result. The next engineering step should be a generation-free inspection of the native dispatch request and observable rejection surface. No rerun is authorized by this Work Item.

## Integrity

- Protocol seal: `2e3817ebedce79b7a5743ec9e1533f8e4dd6f49dc8a9320144a83d83505b69fe`
- Full sanitized report SHA-256 in the retained temporary lab: `37fc233f4feebc976fc2f3d7b707326cae4978960096784715cb1e5064bd63b6`
- Full sanitized subject SHA-256 in the retained temporary lab: `d302b1b9d0db4b98d9d32c3cf34d17970a6262d2dbafc1c0d39caf1f857fbd8d`
- Durable normalized observation: `.ai-org/artifacts/WI-0198/live-observation.json`
- Execution-time approval evidence: Git revision `513efa2a469fdfd2da92ff096ea26f6895721c95`, SHA-256 `e62dd09cdc81b7d43015b7030d21558cf6ff2ce642fd62daa61d660c320ea950`

The temporary full report contains bounded, redacted diagnostics only, but the durable repository record intentionally retains the smaller normalized observation rather than the repeated hashed event journal.

## Corrected generation-free verification

After independent review corrected causal and transient-write overclaims and normalized the repository-language issue:

```text
npm run check
passed

node --test .ai-org/artifacts/WI-0197/runner.test.mjs .ai-org/artifacts/WI-0196/events.test.mjs
28 passed, 0 failed

npm run verify
632 passed, 0 failed
```

These checks did not call a model or repeat the live probe.
