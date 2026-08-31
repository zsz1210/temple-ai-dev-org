# Developer evidence — WI-0056

## Completed

- Validated the exact request payloads against freshly generated installed App Server schemas.
- Confirmed Luna Max through a no-generation `model/list` request.
- Executed exactly one Provider-owned thread and one turn with zero retries.
- Verified exact fixed output through a no-generation `thread/read` and visibility through `thread/list`.
- Captured detailed correlated Provider Token usage.
- Confirmed no model-authored repository changes.
- Restored the normal private-LAN Dashboard after archiving and rebuilding the cursor-invalid telemetry journal.

## Evidence

- `.ai-org/artifacts/WI-0056/preflight.md`
- `.ai-org/artifacts/WI-0056/live-proof-result.md`
- `.ai-org/artifacts/WI-0056/runtime-observation.json`
- `.ai-org/project/tasks.json`
- `.git/temple/control-plane/archive/events-2026-08-31T07-45-54-118Z.jsonl` (local generated archive, SHA-256 pinned in the runtime observation)

## Verification boundary

The live attempt is not repeated during downstream testing or Independent QA. Those stages verify canonical correlation, retained evidence, schema compatibility, repository invariants, exact candidate state, and Dashboard health without creating another Provider thread or turn.

## Unresolved defect

Concurrent Provider notifications can race in telemetry append and assign duplicate cursors. The built-in rebuild recovered the Dashboard without overwriting the archived journal. The concurrency defect needs a separate Work Item and deterministic regression test.
