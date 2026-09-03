# Context/model diagnostic preflight

## Result

The four-condition context/model diagnostic v4 is locally prepared and generation remains disabled pending a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `c291842d43692df0dd117bec75ed3ed716312125caa0e0d383b2e8b06313d90a`
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
- A per-condition Token stop retains exact partial telemetry as a censored observation and permits the remaining unused independent conditions to run once.
- Aggregate budget, program time, Provider, command-policy, protocol, and revision violations still stop the complete run.
- Terra medium, Sol medium, and Sol xhigh are available through the installed `codex-cli 0.151.0-alpha.7.2` App Server contract.
- Inspection passes 67 checks with no failure.
- The focused App Server and experiment suite passes 20 of 20 tests.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Basis for the correction

V3 started Terra medium with full-load context at `2026-09-03T12:49:23.845Z` and interrupted it 142.914 seconds later after the latest observation reached 80,621 Operational Tokens. No condition completed, and the three routed conditions did not start. The result shows that this full-load attempt did not fit the inherited 80,000-Token candidate ceiling; it provides no context, model, effort, quality, or speed comparison. Retry and fallback remained zero.

V4 does not raise that ceiling. It records a condition reaching the ceiling as a bounded censored outcome, preserves its latest usage and timing fields, and continues only to the three still-unused independent one-attempt conditions. No v4 model turn has run.
