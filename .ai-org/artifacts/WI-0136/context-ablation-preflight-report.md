# Context/model diagnostic preflight

## Result

The four-condition context/model diagnostic is locally prepared and generation remains disabled pending exact account approval and the final generation-free preflight.

## Frozen boundary

- Protocol SHA-256: `09cb2b5a3442d637dfc380537e5f2860c116125ab5472a7ead8853b070da687d`
- Conditions: 4
- Routes: Terra medium full-load; Terra medium routed; Sol medium routed; Sol xhigh routed
- Per-condition operational-Token hard stop: 80,000
- Combined operational-Token hard stop: 320,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Network and external actions: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

The limits are safety stops inherited from the already reviewed WI-0136 integration ceiling. They are not expected consumption, price, or permission to purchase capacity.

## Generation-free evidence

- All four conditions contain identical Gateway, Catalog, Orders, Notifications, and Coordinator Git revisions and trees.
- Gateway, Catalog, Orders, and Notifications are at `test`; Coordinator is at `build`, ready for fresh recovery.
- The prepared implementation passes every service, public integration, and held-out compatibility test.
- Participant Doctor checks pass.
- The protocol freezes the runner, analyzer, fixture, task, tests, tool policy, rubric, explicit instruction layers, and output schema by SHA-256.
- Terra medium, Sol medium, and Sol xhigh are available through the installed `codex-cli 0.151.0-alpha.7.2` App Server contract.
- Inspection passes 67 checks with no failure.
- The experiment-specific suite passes 8 of 8 tests.
- `npm run verify` passes 367 of 367 tests with no failure, skip, or cancellation.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Remaining boundary

No diagnostic model turn has run. Context, model, effort, Token, and latency comparisons remain unknown until the exact frozen approval is recorded and all four one-attempt conditions complete. One observation per setting will remain directional rather than statistically generalizable.
