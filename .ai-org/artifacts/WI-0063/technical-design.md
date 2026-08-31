# Technical design — WI-0063

## Provider acknowledgement

`launchProviderOwnedTask` must read these fields from the `thread/start` result object, not from its nested `thread`:

| App Server response field | Temple task field |
|---|---|
| `model` | `effective_model` |
| `reasoningEffort` | `reasoning_effort` |
| `serviceTier` | `service_tier` |

`thread.id`, `thread.ephemeral`, and the thread lifecycle remain nested. The request still records `requested_model` independently. A missing optional acknowledgement remains unknown; the implementation never copies `requested_model` into `effective_model` as a fallback.

## Reroute state transition

Add `model/rerouted` to the normalized Provider notification map. The event stores only bounded identifiers, `from_model`, `to_model`, and the enumerated Provider reason. When its `threadId` correlates to exactly one registered task, update that task through the ordinary task mutation boundary before appending the normalized event. Replace the in-memory correlated task so subsequent `thread/tokenUsage/updated` observations use the rerouted model.

An empty `toModel`, missing task correlation, or task-update failure never updates another task and never triggers a retry or model fallback. The Provider is marked degraded only when a correlated canonical update fails.

## Verification

- Update the fake Provider response to match the installed top-level response schema.
- Assert registration and returned launch metadata for model, reasoning effort, and service tier.
- Emit a reroute before usage and assert the reroute event, canonical task update, and subsequent usage attribution.
- Assert an unregistered reroute cannot mutate task state.
- Run focused Provider tests, full verification, Doctor, and detached-worktree Independent QA.

## Rollback and risk

Rollback is a code revert; no migration is required because existing nullable task fields remain valid. The main risk is treating a request as an observation, which this design explicitly forbids. Another risk is an asynchronous reroute racing usage; the notification queue must preserve arrival order by serializing append processing for state-bearing Provider notifications.
