# Technical design — one-shot Provider-owned pilot

## Pre-launch gate

1. Confirm the retained synthetic repository is clean and preserve its prior WI-0001 history.
2. Create and advance exactly one new synthetic Work Item to an actively claimed Build state.
3. Generate the installed Codex App Server v2 schema into a temporary directory and compare the required `thread/start` and `turn/start` contract with Temple's pinned internal-to-wire map.
4. Start a temporary loopback Control Plane with the real Codex App Server Provider, thread resume disabled, and an isolated state directory.
5. Continue only when the Provider reports ready and the current model list exposes the requested GPT-5.6 Luna profile or the launch contract otherwise accepts the exact requested model.

## Launch and observation

Call `launchProviderOwnedTask` once with the synthetic Work Item, Developer Position and Agent, exact launch revision, `gpt-5.6-luna`, `max`, approval `never`, read-only sandbox, and network disabled. Retain only bounded identifiers, statuses, numeric Token usage, attribution, timing, and non-content provenance.

Observe the temporary journal for the returned task and thread. Stop on terminal completion. If reported cumulative total Tokens reaches 60,000 while active, request one exact-turn interrupt; a 40,000 observation is a warning. At 15 minutes, request one exact-turn interrupt when the exact active turn is known, then stop observation. Never retry a launch, turn, or interrupt.

## Repository and cleanup boundary

The instruction asks for a short structured confirmation and no file mutation. Compare Git status before and after. Stop the temporary Provider and journal, truthfully terminalize or mark the synthetic task attention, and leave the synthetic repository available for review. Restore the ordinary Temple Workspace if the temporary runner required stopping it.

## Risk review

- Token limits are reactive, so one turn and zero retries are the enforceable pre-launch limits.
- Protocol compatibility is rechecked against the exact installed schema before the external boundary.
- Any mismatch, credential request, paid action, effective-model conflict, missing required correlation, unexpected diff, or privacy concern fails closed.
- A Provider-created thread is not automatically deleted, retried, or archived.

## Rollback

Stop the temporary local processes, preserve evidence, and leave the synthetic repository and Provider thread untouched for review. Do not reset, delete, repurpose, or replay them automatically.
