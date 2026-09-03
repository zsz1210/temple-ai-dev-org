# Context/model diagnostic v3 stopped report

## Outcome

The exact-approved v3 attempt stopped at the first condition and was not retried.

- Protocol SHA-256: `c5e0b069880a079de6fd8030fda3818cee92c809bd834999db2a04ca32be147a`
- Started: `2026-09-03T12:49:23.845Z`
- Stopped: `2026-09-03T12:51:46.759Z`
- Elapsed: 142.914 seconds
- Completed conditions: 0 of 4
- Condition at stop: Terra medium with full-load context
- Operational Tokens observed at interruption: 80,621
- Per-condition hard stop: 80,000 Operational Tokens
- Retry and fallback: 0

The final usage observation crossed the limit by 621 Tokens before the asynchronous interrupt completed. No later condition started.

## What the result supports

Under this one observed attempt, the full-load recovery condition did not finish inside the inherited 80,000-Operational-Token ceiling. This is a real resource-bound result: loading broad repository context and continuing tool-assisted recovery can consume the complete candidate envelope before a structured recovery record is returned.

## What the result does not support

The attempt produced no completed condition. It therefore cannot compare:

- full-load context with routed context;
- Terra with Sol at medium effort;
- Sol medium with Sol xhigh;
- completion quality, output speed, or objective recovery accuracy.

V3 retained completed conditions correctly, but none existed. It did not retain a normalized partial-condition telemetry record, so the 80,621 aggregate cannot be separated into input, cached input, output, reasoning, tool-output, or time-to-first-action components.

## Required correction before another live attempt

A successor protocol should treat a per-condition Token ceiling as a recorded censored outcome rather than aborting unrelated one-attempt conditions. It should retain the interrupted condition's last exact usage, elapsed time, route, context strategy, tool-activity counters, and stop reason; then continue only to still-unused independent conditions. Protocol, command-policy, Provider, revision, aggregate-budget, and program-wall-clock violations must continue to stop the entire run. This changes frozen execution semantics and requires a new digest and exact approval before generation.
