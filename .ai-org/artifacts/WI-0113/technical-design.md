# WI-0113 technical design

## Diagnosis

The interrupted `WI-0112` turn made four model cycles. Provider totals at interruption were:

| Field | Tokens |
| --- | ---: |
| Input | 104,426 |
| Cached input | 75,008 |
| Output | 2,220 |
| Reasoning output | 1,017 |
| Gross total | 106,646 |
| Derived non-cached budget | 31,638 |

The gross total is cumulative throughput across tool cycles. Cached input and reasoning output are component fields, not additional to the Provider total. The runner may use the derived non-cached value only as a conservative operational proxy; it must not claim account billing or Credit conversion.

## Launch isolation

Start the child App Server with a copied environment that removes parent task identity, task-specific app-tool routing, and host-origin overrides. Set an explicit compact base instruction, empty selected capability roots, empty environments, and ephemeral history. Pin these request fields through the installed-schema preflight. Candidate filesystem and command policies remain unchanged.

## Usage model

Retain full cumulative usage on each turn and event. Keep:

- `aggregate_tokens`: gross Provider total throughput;
- `aggregate_budget_tokens`: non-cached input plus output;
- per-turn `usage`, `total_tokens`, and `budget_tokens`.

The existing manifest Token limits apply to `budget_tokens`. This preserves the reviewed numeric envelope while correcting the metric it governs. Time, disk, path, attempt, and aggregate boundaries remain independent.

## Failure scope

`per-turn-token-hard-limit` and `per-turn-time-hard-limit` are candidate-local. They stop that candidate, record repository state, and allow the next sequential independent wave. Aggregate limits, protocol incompatibility, model rerouting, runtime permission requests, dirty starts, disallowed paths, and disk boundaries remain program-fatal. There are no automatic retries.

## Privacy

Repository evidence retains numeric usage, operation counts, and bounded diagnoses only. Raw prompts, raw responses, and hidden reasoning remain outside Git.
