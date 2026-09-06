# Full versus Model: partial comparison and harness finding

## Outcome

The authorized experiment actually ran. Five of eight scheduled stages completed;
the sixth stopped on `argument-shape` while proposing a `temple-context-enter`
command. The final Full delivery did not start. This is a stopped, incomplete
counterbalanced experiment, not an eight-stage success.

Total observed usage: **316272 operational Tokens**. Elapsed run time:
**757222 ms (12.62 minutes)**. No retry, fallback, reset, purchase, refill or
extra model judge occurred. The interrupt was acknowledged and all attempted
providers exited. The final seal verified successfully.

## Complete comparable deliveries

| Metric | Subject 1: Full | Subject 2: Model | Observed difference |
| --- | ---: | ---: | ---: |
| Operational Tokens | 124020 | 113137 | Model -8.78% |
| Actor elapsed milliseconds, Build + Verify | 273549 | 271806 | Model -0.64% |
| Input Tokens | 1316641 | 1261566 | — |
| Cached input Tokens | 1200384 | 1155584 | — |
| Non-cached input Tokens | 116257 | 105982 | — |
| Output Tokens | 7763 | 7155 | — |
| Cached/input ratio | 91.17% | 91.60% | — |
| Product tests, hidden oracle, exact handoff and final acceptance | Passed | Passed | Same observed outcome |

These are descriptive results for **one completed delivery per format**, not a
general efficiency estimate. Both used Terra medium, the same source, task and
acceptance contract; only the requested context representation differed. Cache
was uncontrolled, execution was sequential and the planned reverse-order pair
did not complete. Selecting only successful deliveries can hide reliability
costs: the interrupted Model delivery is retained below and in the total usage.

Operational Tokens = input minus cached input plus output. This is not billing
or a claim that cached Tokens are free. Timing is actor elapsed time, not token
generation speed; setup and validation are not equivalent to inference latency.
The 1743 ms observed difference is too small to establish a practical speed gain.

## All attempted stages

| Subject | Format | Stage | Outcome | Operational Tokens | Actor ms |
| --- | --- | --- | --- | ---: | ---: |
| 1 | Full | Build | Completed, accepted handoff | 68380 | 183449 |
| 1 | Full | Verify | Completed, accepted exact candidate | 55640 | 90100 |
| 2 | Model | Build | Completed, accepted handoff | 60671 | 184632 |
| 2 | Model | Verify | Completed, accepted exact candidate | 52466 | 87174 |
| 3 | Model | Build | Completed after product-test correction | 66821 | 189392 |
| 3 | Model | Verify | Interrupted: argument-shape | 12294 | 21245 |
| 4 | Full | Both | Not started | Unavailable | Unavailable |

Subject 3's Builder observed test exits `[1, 0, 0]` and ultimately passed the
oracle and handoff checks. This is within-turn development/rework, not a new
experiment attempt. Its Verifier ran no product tests before interruption and
has no final acceptance. Its partial low Token count is not a saving.

All attempted stages stayed below the 80000 warning threshold. Thus offline
tests prove the warning behavior, but this live sample did not exercise it.
Neither the aggregate 640000 budget nor stage/aggregate time limits caused the stop.

## Failure diagnosis and evidence limits

The retained event identifies an allowed command family (`temple`) and operation
(`temple-context-enter`), rejected for argument shape at command start. It does
not identify a product defect, model reroute or budget problem. The guard
interrupted the stage and confirmed provider exit; this is not proof that a
provider can retract an already-started shell command atomically.

The privacy-preserving record stores command hashes and categories, not raw
arguments. `argument-shape` currently covers multiple conditions: missing values,
extra positionals, malformed available-source JSON and invalid source-row shape.
Consequently **the exact malformed argument and whether the guard was too strict
cannot be determined from retained evidence**. Do not assert a specific JSON or
shell-quoting cause. One earlier Model Verifier passed; format causality is not
established by this later failure.

## Recommended improvement, before another experiment

1. Split `argument-shape` into bounded, privacy-safe reason codes (missing value,
   unexpected positional, invalid source JSON/row) without recording argument
   bodies. Cover each with offline negative tests. Better evidence is necessary
   before deciding which compatibility behavior to change.
2. Evaluate a deterministic helper or structured argument transport for complex
   context-entry inputs. Preserve actual-read requirements, source hashes,
   identity, scope and sandbox checks; do not fabricate read acknowledgements or
   broadly relax the command allowlist. Validate against supported installed CLI
   forms, not an invented interface. This needs a bounded implementation design.
3. Keep Model format optional. The completed pair suggests a modest Token signal,
   not a speed gain or justification for making it default. Retain both successful
   and interrupted deliveries in analysis. Do not spend on repeated live runs
   before command-contract diagnostics and compatibility tests are ready.

No follow-on implementation or new run is implied by this report. This consumed
protocol must not be resumed or patched mid-experiment.

## Traceability

- Execution owner: WI-0217; instrument/readiness owner: WI-0216.
- Source: `570a36acbe70ef2e4c6f435f5aa1c6d1c87e9474`.
- Protocol: `sha256:abf8d24ebc769bc4363f274e0482b781ef357630c7836db38d6f75e225b7f6ea`.
- Seal: `sha256:568c82b4cea9b6bf934653533d0889afa03274baf96f0777aeaf833e6a9dcbd4`.
- Manifest: `sha256:2bb4031b9857351005471722a8f66fcd3e2aa436cb99dc0ae84913dc6784e93f`.
- [Measurements](measurements.json), [approval](../WI-0216/approval.json),
  [independent readiness](../WI-0216/readiness-review.md),
  [implementation verification](../WI-0216/verification.md).
- Software full suite: 664/664; independent offline readiness: 72/72;
  pre-live fast checks: 54/54. These are not additional live samples.

Raw local laboratory and prior sealed WI-0215 evidence are preserved. No raw
prompts, hidden reasoning, host paths or command arguments are published here.
