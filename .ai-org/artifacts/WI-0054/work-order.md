# Work order: first provider-owned live Token proof

## Objective

Run one minimal real Codex turn through Temple's provider-owned launch bridge and determine whether the active connection receives correlatable detailed Token usage.

## Approved execution contract

- Model: `gpt-5.6-luna`
- Reasoning effort: `max`
- Thread count: 1
- Turn count: 1
- Automatic retries: 0
- Sandbox: read-only
- Network: disabled
- Approval policy: never
- Wall-clock interrupt: 180 seconds after `turn/start`
- Reactive Token interrupt threshold: 20,000 reported total Tokens

The Token threshold is not described as a hard provider cap. Official App Server documentation exposes Token usage notifications and goal accounting, but does not guarantee that a goal Token budget automatically interrupts generation. Temple will request `turn/interrupt` if a reported update crosses the threshold while the turn is still active.

## Exact instruction

> Return exactly `TEMPLE_PROVIDER_OWNED_LIVE_PROOF_OK` and nothing else. Do not call tools, inspect files, modify state, access network, or ask questions.

## Stop boundary

Do not retry on thread creation failure, registration failure, turn rejection, uncertain delivery, timeout, missing usage, or missing Desktop visibility. Record one truthful outcome and stop.
