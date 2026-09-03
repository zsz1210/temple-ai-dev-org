# Context/model diagnostic v2 stopped report

## Outcome

The exact-approved v2 attempt stopped as designed and was not retried.

- Protocol SHA-256: `09cb2b5a3442d637dfc380537e5f2860c116125ab5472a7ead8853b070da687d`
- Started: `2026-09-03T12:31:05.205Z`
- Stopped: `2026-09-03T12:38:29.005Z`
- Completed conditions: 1 of 4
- Operational Tokens observed before stop: 104,893
- Retry and fallback: 0

The Terra full-load condition completed. During Terra routed, the Agent selected the repository-local read-only command `git ls-tree -r --name-only HEAD`. That command was not in the experiment allowlist, so the runner interrupted the turn with `command-policy-violation` before Sol ran.

## Interpretation

This result is a harness-policy finding, not a Context Routing or model-performance result. It contains no valid Terra-versus-Sol comparison and cannot support a routing recommendation.

The v2 stopped artifact retained only the aggregate completed-condition count and Token total. It did not retain the already normalized completed-condition record, so the completed Terra full-load Token and timing breakdown cannot be recovered from the retained artifact. V3 must retain completed normalized conditions in every stopped record.

## Correction boundary

V3 may add only the bounded read-only `git ls-tree` prefix, retain completed normalized condition records on stop, rebuild byte-matched fixtures, freeze a new protocol digest, and require a new exact approval. The v2 approval cannot authorize v3.
