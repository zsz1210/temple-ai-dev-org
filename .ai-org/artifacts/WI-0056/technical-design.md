# Technical design: corrected one-shot live proof runner

## Execution path

1. Confirm the exact payloads against freshly generated installed schemas and confirm Luna Max through `model/list` without generation.
2. Commit the bounded experiment contract before external execution.
3. Gracefully stop the existing local Control Plane so its writer lease and journal are closed.
4. Start the current repository Control Plane programmatically on loopback with the real Codex App Server Provider and live resume disabled.
5. Confirm the Provider reports `ready`.
6. Invoke `launchProviderOwnedTask` exactly once with the active Developer claim, exact launch revision, fixed instruction, Luna Max, read-only sandbox, network disabled, and approval policy never.
7. Observe only correlated new journal records for the returned task and thread.
8. Stop on `turn/completed`. Request `turn/interrupt` no more than once if reported total Tokens exceed 20,000 while active or 180 seconds elapse.
9. Close the one-shot Control Plane, update the canonical task truthfully, and restart the normal private-LAN read-only Dashboard.

The runner is an in-memory local Node module and is not persisted as a Dashboard mutation route or repository executable.

## Evidence extraction

Retain bounded identifiers, statuses, timing, numeric usage, attribution, fixed-marker equality, stop-boundary state, and repository diff summary. Do not retain raw Provider payloads, hidden reasoning, command output, or arbitrary model content.

Only `thread/tokenUsage/updated` is accepted as detailed task-attributed Token evidence. Requested model is not promoted to observed effective model unless Provider evidence supplies it. Missing usage remains unknown.

## Safety and failure behavior

- There is no retry branch.
- Thread/start is attempted once; turn/start is attempted at most once.
- A failure before registration creates no Temple task; a failure after registration preserves a truthful task state.
- Acknowledgement timeout means uncertain delivery and ends the proof.
- Read-only and network-disabled policies are included in the schema-validated payload.
- The Git state is checked before and after model execution.
- The normal LAN Dashboard is restored in cleanup regardless of experiment outcome.

## Rollback

Preserve audit evidence. Stop the App Server and one-shot Control Plane, mark any registered task truthfully, and restore the normal read-only Dashboard. Do not delete or recreate the Provider thread automatically.
