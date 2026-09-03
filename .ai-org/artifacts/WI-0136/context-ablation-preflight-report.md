# Context/model diagnostic preflight

## Result

The four-condition context/model diagnostic v5 is locally prepared and generation remains disabled pending a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `9c947a32b2e63f771de3bcdfae2f3e95dd8ab69b66a65e812473c28ec04d615f`
- Conditions: 4
- Order: Terra medium routed; Sol medium routed; Sol xhigh routed; Terra medium full-load
- Routed-condition Operational-Token hard stop: 80,000 each
- Full-load Operational-Token hard stop: 120,000
- Combined Operational-Token hard stop: 360,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Network and external actions: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

The routed limits retain the reviewed 80,000 ceiling. V2 completed full-load before its combined full-load-plus-partial-routed observation reached 104,893, while v3 stopped full-load at 80,621. V5 therefore gives full-load a 120,000 ceiling and increases the total by only 40,000. These remain safety stops, not expected consumption, price, or permission to purchase capacity.

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
- The focused App Server and experiment suite covers condition-specific approval limits, censored outcomes, whole-run stops, and non-invented comparison deltas.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Basis for the correction

V3 started Terra medium with full-load context at `2026-09-03T12:49:23.845Z` and interrupted it 142.914 seconds later after the latest observation reached 80,621 Operational Tokens. No condition completed, and the three routed conditions did not start. The result shows that this full-load attempt did not fit the inherited 80,000-Token candidate ceiling; it provides no context, model, effort, quality, or speed comparison. Retry and fallback remained zero.

V4 implemented censored-condition isolation but was not approved or run. V5 retains that behavior, prioritizes the three routed model comparisons, and moves full-load to the final condition with the evidence-backed 120,000 ceiling. No v5 model turn has run.
