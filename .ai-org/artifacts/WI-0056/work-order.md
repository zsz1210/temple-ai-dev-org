# Work order: corrected provider-owned live Token proof

## Objective

Run the corrected Provider-owned launch path once and determine whether one real Codex turn can be correlated to a canonical Temple task and detailed Provider-reported Token usage.

## Approved execution contract

- Model: `gpt-5.6-luna`
- Reasoning effort: `max`
- Provider thread count: 1
- Provider turn count: 1
- Automatic or manual retries: 0
- Sandbox: read-only
- Network: disabled
- Approval policy: never
- Wall-clock interrupt: 180 seconds after `turn/start`
- Reactive Token interrupt threshold: 20,000 reported total Tokens

The Token threshold is reactive, not a hard Provider cap. Temple requests `turn/interrupt` once only if a reported cumulative total crosses the threshold while the turn is active.

## Exact instruction

> Return exactly `TEMPLE_PROVIDER_OWNED_LIVE_PROOF_OK` and nothing else. Do not call tools, inspect files, modify state, access network, or ask questions.

## Stop boundary

Do not retry after thread creation failure, registration failure, turn rejection, acknowledgement uncertainty, timeout, missing usage, unexpected output, or missing task visibility. Record one truthful terminal experiment outcome and restore the normal LAN Dashboard.

