# Developer report — WI-0040

## Implemented

- Added the existing `temple.usage-baseline/v1` projection to each control-plane snapshot by aggregating the bounded in-memory journal, canonical observer Work Items, and the registered task topology.
- Kept snapshot aggregation local and read-only: no model call, account-usage probe, price lookup, generated-view write, provider mutation, or canonical-state mutation occurs.
- Added a responsive `Usage & models` Dashboard workspace for qualification progress, Token composition, task-registration coverage, observed models, usage-driver groups, missing dimensions, and non-authority limits.
- Preserved nullable Token and cost values as `unknown`; an empty live self-host state does not render a zero-valued chart.
- Passed the same bounded usage projection through the private read-only viewer while continuing to remove daemon, Inbox, Agent Command, session-secret, and raw-event data.

## Verification before candidate commit

- Focused control-plane, private-viewer, Inbox, and Phase 4B tests: 26 passed, 0 failed.
- Full `npm run verify`: 217 passed, 0 failed, 0 skipped.
- Runtime schema validation: 60 documents valid against 24 schemas.
- Doctor after correcting the cancelled setup record: 35 passed, 1 known stale-parallel-plan warning, 0 failed.

## Retained limits

- The real self-host journal still has zero detailed Token observations, so the live view must remain `insufficient-data` and `not-qualified`.
- This implementation does not add a time-series chart, monetary cost, matched model evaluation, a model recommendation claim, routing authority, or automatic model switching.
- Runtime visual review and independent reproduction remain required at the exact candidate revision.
