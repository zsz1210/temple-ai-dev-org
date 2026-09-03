# Context/model diagnostic preflight

## Result

The corrected four-condition context/model diagnostic v3 is locally prepared and generation remains disabled pending a new exact account approval and the final generation-free preflight.

## Frozen boundary

- Protocol SHA-256: `c5e0b069880a079de6fd8030fda3818cee92c809bd834999db2a04ca32be147a`
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
- The recovery allowlist includes the repository-local read-only `git ls-tree` command observed in the v2 stopped attempt.
- A stopped v3 run retains normalized completed-condition records while still prohibiting retry and fallback.
- Terra medium, Sol medium, and Sol xhigh are available through the installed `codex-cli 0.151.0-alpha.7.2` App Server contract.
- Inspection passes 67 checks with no failure.
- The focused App Server and experiment suite passes 18 of 18 tests.
- The repository verification suite passes 368 of 368 tests.
- `npm run verify` passes 367 of 367 tests with no failure, skip, or cancellation.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Remaining boundary

No v3 model turn has run. The stopped v2 attempt cannot provide a valid comparison. Context, model, effort, Token, and latency comparisons therefore remain unknown until the new exact approval is recorded and all four v3 one-attempt conditions complete. One observation per setting will remain directional rather than statistically generalizable.
