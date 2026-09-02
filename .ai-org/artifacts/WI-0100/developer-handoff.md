# WI-0100 Developer handoff

## Candidate

- Revision: `3c94b998d01ff0a9daf03cb99998721f218ee846`
- Branch: `codex/wi-0100-optional-console-collector`
- UI delivery mode: `not-applicable`

## Completed

- Kept Temple Core complete with no optional process installed or running after initialization.
- Added `temple console start` as an explicitly started, GET-only Management Console with no writer lease, Codex Provider, repository polling loop, Human Inbox, or Agent Commands.
- Added `temple usage collect` as a separate foreground Codex telemetry writer with no HTTP listener.
- Changed the experimental macOS managed-local service plan to start only the Usage Collector and expose no Console or network listener.
- Preserved the legacy combined `control-plane start` path for Alpha compatibility.
- Documented the optional boundary, retained-history behavior, unknown usage semantics, and automatic-capture exclusion in ADR-0044 and the operations guides.

## Verification

- Node.js `v24.20.0` `npm run verify`: 279/279 tests passed; repository, documentation-link, and package checks passed.
- `npm run test:browser`: four responsive viewports, six primary views per viewport, and reduced-motion coverage passed.
- Focused runtime tests prove Core installs neither optional runtime, Console and Collector coexist, Console obtains no writer lease, Console-only requests do not grow telemetry, file changes emit bounded refresh signals, the Collector retains telemetry, and the Collector opens no HTTP listener.

## Retained limits

- The browser gate exercises the existing Management Console shell plus the new read-only mode; no redesign is claimed.
- The Collector test uses a deterministic Provider double. No live Codex model turn, external release, publication, deployment, or managed service installation was performed.
- Automatic per-task start and final-usage-safe shutdown remain a later decision.
