# Context-routing ablation preflight

## Result

The full-load versus routed-context ablation is locally ready and generation remains disabled pending exact account approval.

## Frozen boundary

- Protocol SHA-256: `3eff52f42ffc31a74f169aa3f462bb0b8fcb04de2a623a2901508b9c51f64e73`
- Conditions: 2
- Model: `gpt-5.6-terra`
- Reasoning effort: `medium`
- Per-condition operational-Token hard stop: 80,000
- Combined operational-Token hard stop: 160,000
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Network and external actions: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

The limits are safety stops inherited from the already reviewed WI-0136 integration ceiling. They are not expected consumption, price, or permission to purchase capacity.

## Generation-free evidence

- The full-load and routed conditions contain identical Gateway, Catalog, Orders, Notifications, and Coordinator Git revisions and trees.
- Gateway, Catalog, Orders, and Notifications are at `test`; Coordinator is at `build`, ready for fresh recovery.
- The prepared implementation passes every service, public integration, and held-out compatibility test.
- Participant Doctor checks pass.
- The protocol freezes the runner, analyzer, fixture, task, tests, tool policy, rubric, explicit instruction layers, and output schema by SHA-256.
- Terra medium is available through the installed `codex-cli 0.151.0-alpha.7.2` App Server contract.
- Inspection passes 37 checks with no failure.
- The experiment-specific suite passes 8 of 8 tests.
- `npm run verify` passes 367 of 367 tests with no failure, skip, or cancellation.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Remaining boundary

No ablation model turn has run. The result, Token comparison, latency comparison, and recommendation remain unknown until the exact frozen approval is recorded and both one-attempt conditions complete.
