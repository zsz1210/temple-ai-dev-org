# Technical design: one-shot live proof runner

## Execution path

1. Gracefully stop the existing local Control Plane so its writer lease and telemetry journal are closed.
2. Start the current repository Control Plane programmatically on loopback with the real Codex App Server Provider and thread resume disabled.
3. Confirm the Provider reports `ready`.
4. Call `launchProviderOwnedTask` with the approved Work Item claim, exact launch revision, model, reasoning, read-only sandbox, network prohibition, and instruction.
5. Observe only new journal records for the returned task and thread.
6. Stop on a terminal `turn/completed` event. If reported cumulative total Tokens exceed 20,000 while the turn remains active, or 180 seconds elapse, use the existing exact-state Agent command path to request `turn/interrupt` once.
7. Close the one-shot Control Plane, update the canonical task to its truthful terminal or attention status, and restart the normal private-LAN read-only Dashboard.

The one-shot orchestration runs from an in-memory local Node module. It does not add a Dashboard mutation route or persistent executable to the repository.

## Evidence extraction

The result retains bounded identifiers, statuses, timing, numeric usage, attribution, stop-boundary state, and repository diff summary. It does not retain raw Provider payloads, hidden reasoning, command output, or model instruction content beyond the separately approved work order.

Provider `thread/tokenUsage/updated` is the only source for detailed task-attributed Token values. Account usage remains unallocated. Requested model is not promoted to observed effective model unless a Provider event reports it.

## Visibility check

After the Provider turn stops, inspect the returned stable thread ID through supported Codex task/thread listing. Record `visible`, `not-observed`, or `unknown`; absence from one list is not treated as proof that the durable Provider thread was deleted or failed.

## Safety and failure behavior

- No retry path exists.
- The model sandbox is read-only and network-disabled.
- The repository diff is checked before and after the turn.
- Failure before canonical registration creates no Temple task; failure after registration retains the task and truthful attention state.
- A Provider acknowledgement timeout remains unknown delivery and is not retried.
- The reactive Token threshold may be observed only after some usage has already occurred; it is not a hard pre-generation maximum.

## Rollback

Preserve the audit evidence. If the proof infrastructure behaves incorrectly, stop the App Server and normal Control Plane, mark the task attention or completed truthfully, and revert only repository evidence changes. Do not delete or recreate the Provider thread automatically.
