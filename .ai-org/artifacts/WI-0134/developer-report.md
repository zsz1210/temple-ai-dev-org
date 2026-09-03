# Developer report - WI-0134

## Delivered

- Added `temple evidence invalidate` with required Evidence ID and reason, optional current same-Work-Item replacement, and validated actor identity.
- Retained invalidated records and their artifact references while recording timestamp, actor, reason, replacement metadata, and `evidence_invalidated` audit events.
- Added rollback of the registry mutation when the audit event cannot be appended.
- Kept exact-revision artifact validation unchanged for active evidence and excluded only explicitly invalidated records from artifact-health enforcement.
- Invalidated the two malformed unused records from WI-0130 and WI-0131 through the new CLI. No historical artifact was edited or deleted.

## Verification

- `node --check src/evidence.mjs`: pass.
- `node --check src/cli.mjs`: pass.
- `node --test test/evidence-observer.test.mjs`: 14 / 14 pass.
- `npm run verify`: 358 / 358 pass, including repository, documentation-link, and package-boundary checks.
- Doctor after invalidation: healthy with zero failures; only the previously generated parallel-plan staleness warning remained before final plan rebuild.

## External actions

No Provider call, push, merge, deployment, publication, or release occurred.
