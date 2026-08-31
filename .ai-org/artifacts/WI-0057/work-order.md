# Work order: serialize concurrent telemetry journal appends

## Objective

Correct the real cursor-allocation race observed during WI-0056 so one live Control Plane journal remains valid when several Provider notifications arrive concurrently.

## Scope

- Serialize one journal instance's identity check, cursor allocation, durable append, compaction, checkpoint, and listener notification.
- Make close stop accepting new appends and wait for already accepted mutations.
- Add deterministic concurrent unique-event and duplicate-identity regression coverage.
- Preserve existing privacy, compaction, replay, and single-writer behavior.

## Stop boundary

Do not modify the archived WI-0056 journal, Provider protocol, retry policy, Dashboard authority, external services, or release state.

