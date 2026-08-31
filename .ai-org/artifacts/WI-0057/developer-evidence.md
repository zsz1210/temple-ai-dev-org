# Developer evidence — WI-0057

## Change

- Added one failure-isolated promise-tail mutation queue inside `openTelemetryJournal`.
- Serialized identity lookup, cursor allocation, durable append, in-memory update, compaction, checkpoint, and listener notification.
- Made close stop admission, wait for accepted operations, and reject later appends explicitly.
- Added deterministic concurrent unique-event, duplicate-identity, collision-recovery, close-drain, and disk-reopen coverage.

## Red/green proof

The new regression was applied without the source correction to pre-fix revision `24747c2b7b7cbbe8fc8ba245a420ed7ced008400`. It failed deterministically: all 64 concurrent unique appends returned cursor `1` instead of `1…64`.

On candidate `50765844f6123025a78004eb4498a0a8752ffcdf`:

- focused telemetry tests: 2 passed;
- full `npm run verify`: 230 passed, 0 failed;
- concurrent result cursors: `1…66`;
- one concurrent duplicate was written once and returned one duplicate result;
- an identity collision did not poison the next accepted mutation;
- close drained the accepted append, rejected a later append, and the disk journal reopened with strict cursors.

## Live self-host proof

The old running process reproduced four more invalid adjacent cursor pairs in a 1,910-line journal. Temple archived it unchanged with SHA-256 `cc2933a36182a806740fc9bc804639e107c844d957358504b34cf5ac0b01384c` and rebuilt canonical events.

The corrected candidate then started against the rebuilt state, received the real Codex startup observation burst, stopped cleanly, and reopened the same journal successfully. The active journal contained 1,514 records with cursors `1…1514` and zero non-increasing adjacent pairs. The private home-LAN Dashboard is running with the Provider ready.

## Boundaries

No model generation, Provider command, archive rewrite, external mutation, release, publication, deployment, or push occurred.
