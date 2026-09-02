# WI-0094 Developer handoff

## Candidate

`d2e2e8ed9ec8fd9476a529cfc1f37790220341d7`

## Implemented

- The optional Management Console now omits duplicate Observer evidence, duplicate canonical work collections, top-level task items, and retained Provider task histories that its human-facing views do not render.
- Organization, Work Item, task-summary, Usage, conditions, providers, and timeline data used by the Console remain present.
- Internal control-plane snapshots, retained telemetry, canonical evidence, cache invalidation, privacy redaction, and lifecycle authority are unchanged.

## Verification

- Focused Console and Usage tests: 25 passed, 0 failed.
- Full `npm run verify`: 280 passed, 0 failed at the exact candidate revision.
- Representative HTTP payload: 2,077,930 bytes before; 336,650 bytes after; 83.8% reduction.
- Candidate cached p95: 3.502 ms. Candidate uncached rebuild p95: 907.557 ms.
- All approved targets in `.ai-org/artifacts/work-orders/WI-0094.md` passed.

## Independent checks requested

- Re-run the structural projection test and full verification from the exact candidate revision.
- Confirm the read-only Console still renders every primary view with real repository data.
- Re-measure the live payload and both cached and invalidated request paths.
- Confirm new canonical or retained Usage data still invalidates the projection and becomes visible.

