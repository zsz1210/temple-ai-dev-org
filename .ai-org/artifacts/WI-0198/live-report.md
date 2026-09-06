# WI-0198 native child compatibility probe

## Outcome

The one approved live arm stopped without retry. It did not establish native child-observation compatibility.

The parent completed, but its native informational-helper dispatch failed before a helper was created. The observer therefore recorded zero children where the sealed protocol required exactly one, producing the named stop `native-helper-unobserved`. Cleanup was observed terminal, no files changed, and no out-of-scope paths were reported.

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

The WI-0196 two-phase acquisition logic was not exercised because no candidate child identity appeared. The result narrows the remaining problem to the dispatch boundary before acquisition, rather than showing a binding or replay failure after child creation.

The retained privacy boundary does not include raw tool failure output, so this run cannot distinguish whether the pre-child rejection came from runtime capacity, Provider support, request semantics, or another native dispatch condition. Naming one of those as the cause would be speculation.

This result is useful but not a successful compatibility result. The next engineering step should be a generation-free inspection of the native dispatch request and observable rejection surface. No rerun is authorized by this Work Item.

## Integrity

- Protocol seal: `2e3817ebedce79b7a5743ec9e1533f8e4dd6f49dc8a9320144a83d83505b69fe`
- Full sanitized report SHA-256 in the retained temporary lab: `37fc233f4feebc976fc2f3d7b707326cae4978960096784715cb1e5064bd63b6`
- Full sanitized subject SHA-256 in the retained temporary lab: `d302b1b9d0db4b98d9d32c3cf34d17970a6262d2dbafc1c0d39caf1f857fbd8d`
- Durable normalized observation: `.ai-org/artifacts/WI-0198/live-observation.json`

The temporary full report contains bounded, redacted diagnostics only, but the durable repository record intentionally retains the smaller normalized observation rather than the repeated hashed event journal.
