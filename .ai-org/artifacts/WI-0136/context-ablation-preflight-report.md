# Context/model diagnostic preflight

## Result

The two-condition context-recovery qualification v6 is locally prepared and generation remains disabled pending a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `74f581c82408340462f1c65ef6a0666847c40ac4750303d08c5adb60ee6c153f`
- Conditions: 2
- Order: Terra medium routed; Terra medium full-load
- Routed-condition Operational-Token hard stop: 80,000
- Full-load Operational-Token hard stop: 120,000
- Combined Operational-Token hard stop: 200,000
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Network and external actions: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

V5 completed Terra routed within 53,823 Operational Tokens, so that condition retains its reviewed 80,000 ceiling. Full-load retains the evidence-backed 120,000 ceiling introduced in v5. The two-condition 200,000 total is their exact sum. These remain safety stops, not expected consumption, price, or permission to purchase capacity.

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
- Inspection passes 37 checks with no failure.
- The focused App Server and experiment suite passes 24 of 24 tests, including exact slice-ID schema/evaluator parity, causal stop reporting, censored outcomes, and stopped-run analysis.
- An unapproved ablation run exits with `exact-human-approval-required` and creates no live result, stopped-run, or analysis artifact.

## Basis for the correction

V5 attempted all four conditions and retained 233,753 Operational Tokens. Terra routed completed, both Sol routes were censored at 80,156, and Terra full-load stopped on a chained shell command prohibited by the frozen command policy. It also exposed a loose `completed_slices` schema paired with an exact-ID evaluator and a top-level stop reason that masked the earlier causal failure.

V6 fixes those harness defects without relaxing command policy. The output schema and evaluator now share the exact three slice IDs, the earliest causal condition failure is preserved, and a fully observed stopped run can produce a non-invented analysis. V6 returns to the minimum qualification required before the main comparison: matched Terra routed and Terra full-load conditions only. No v6 model turn has run.
