# Fresh-session clean-room rehearsal v2 — evidence attribution erratum

- Corrective Work Item: `WI-0157`
- Affected report: [Fresh-session clean-room rehearsal v2](fresh-session-clean-room-rehearsal-v2.md)
- Date: 2026-09-04
- Status: **Attribution corrected; sealed source evidence preserved**

## Correction

The WI-0156 report attributed a change to `.ai-org/views/capabilities.json.generated_at` to Doctor during the read-only recovery task. That attribution was incorrect.

The recorded sequence shows that delivery closeout generated the view at `2026-09-04T13:15:40.969Z`. After delivery and before the recovery task began, the coordinator ran ordinary `status --json` without `--no-write`; that command intentionally regenerated the view at `2026-09-04T13:16:39.279Z`. Recovery began later, at approximately `2026-09-04T13:16:57Z`.

## Deterministic reproduction

Doctor was rerun against the retained QueueKeep repository with the generated Capability Registry hashed before and after the command.

- Before Doctor SHA-256: `32c1437db96941c31380387a660e7943d405129b02ee48b03195770bacd5d6da`
- After Doctor SHA-256: `32c1437db96941c31380387a660e7943d405129b02ee48b03195770bacd5d6da`
- Doctor result: 36 pass, 1 warning, 0 failures

Repository source tests also verify that Doctor and `status --no-write` preserve generated Capability Registry bytes. Ordinary `status` remains an explicit generated-view writer.

## Corrected interpretation

The cold-recovery task did not mutate the generated Capability Registry through Doctor. The byte difference observed around recovery already existed because of the coordinator's intervening write-enabled Status command.

The other WI-0156 observations and limits remain unchanged: closeout help omitted required named evidence, a transition accepted a nonexistent repository artifact path, and the run did not demonstrate a speed or Token-efficiency improvement.

## Evidence-preservation note

The original WI-0156 report and its content-addressed Evidence remain byte-for-byte unchanged. This append-only erratum is the current interpretation of the timestamp evidence and supersedes only finding 3 in that report.
