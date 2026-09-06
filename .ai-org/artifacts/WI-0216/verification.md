# Developer verification

Candidate: `92cb0a01` (warning policy and offline regression tests).

- Final `npm run verify`: 664 passed, zero failed, skipped or cancelled;
  149845.540334 ms.
- Focused format/material/command tests: 33 passed.
- Doctor before handoff: 37 passed, zero warnings or failures.
- WI-0215 sealed laboratory verified unchanged using `verify-seal`.
- `git diff --check` passed.

The first full run had one failing new test: its simulated assessment omitted
`exact_handoff`, so the quality check correctly rejected it before the expected
deadline assertion. The fixture was corrected; the focused suite and the final
complete suite above both passed. No production gate was relaxed to fix the test.

Tests cover the warning threshold and deduplication, legacy hard limits, aggregate
usage across stages, invalid usage, one-shot approvals, rejected v1 bindings,
preparation deadline exhaustion and final assessment deadline exhaustion.
Provider-event accounting calls the tested budget recorder; existing provider
interruption, malformed/regressed usage and isolation tests remain in the full suite.

## Remaining boundary

This is Developer evidence, not Independent QA. No new live model generation,
approval consumption, retry, reset or spending occurred. Independent review of
the exact candidate and fresh sandbox/protocol readiness remain before a live run.
No evidence here establishes a Full-versus-Model efficiency result.

The successor design retains four counterbalanced deliveries, Terra medium,
640000 operational Tokens aggregate, 48 minutes aggregate and six minutes per
stage. 80000 stage Tokens now records a warning; the aggregate budget still stops
execution. A new frozen approval must bind the v2 protocol, not the consumed v1 run.
