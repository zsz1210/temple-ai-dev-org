# WI-0081 Developer evidence

Date: 2026-09-01
Position: Developer
Agent Identity: Rikku (`agent-rikku`)
Base revision: `8a7afd309e408c9257680f339d1c26cfc3ac6f88`

## Implemented slice

- Replaced the accepted static Management Console proposal with the production renderer backed by `/api/v1/snapshot` and the existing SSE refresh path.
- Added human-facing Overview, Work, Team, Usage, System, and History views while preserving the private-viewer redaction and read-only boundary.
- Kept lifecycle, execution, model, Token, impediment, and authority fields evidence-qualified. Missing observations remain visibly unknown instead of being inferred.
- Added responsive layouts for ultrawide, tablet, and mobile viewports; the mobile navigation remains keyboard-operable and the motion indicator respects reduced-motion preferences.
- Limited the default History view to the latest 20 records per section while retaining search across the available bounded snapshot.

## Verification

- Focused control-plane tests: 23 passed, 0 failed.
- Full local verification: `npm run verify` completed with 257 passed, 0 failed.
- Browser console at warning level after navigation and reload: 0 errors, 0 warnings.
- Viewport checks: 2560x1080, 1024x768, 390x844, and 320x720.
- Horizontal overflow checks at 1024, 390, and 320 pixels: document width matched viewport width.
- Live private-LAN data observed: WI-0081 and WI-0082, five Agent Identities, ten Position assignments, 23,433 recorded Tokens from one qualified observation, repository/provider status, and canonical history.

## Evidence boundary

This record describes the current uncommitted working tree. It is implementation and local runtime evidence only; it is not an exact-revision Independent QA or release approval.

## Human-interface correction pass

- Changed the Work inventory to use the full content width at ordinary desktop sizes and retain the split inventory/detail layout only when the content container is at least 1280 pixels wide.
- Replaced the table's long release-decision label with `Release review`, allowed bounded multi-line titles, and made revision hashes wrap without clipping.
- Grouped repeated stale-verification records into one human-readable condition with closed technical disclosure, and translated the unavailable Token-anomaly state into a user-facing explanation.
- Limited Overview to the two highest-priority operational summaries and moved blocked/release workflow counts behind one direct Work link.
- Removed blocked lifecycle state from the observed-execution predicate; only a claim or current task/runtime observation now enters the execution map.
- Reset primary navigation to the top of the destination and focus its labeled region without exposing the browser's default heading outline.
- Kept mobile statistics in a two-column summary, made Team/System tabs horizontally resilient, and stacked mobile execution-card headings above long status badges.
- Re-ran 23 focused control-plane tests and the complete `npm run verify` suite: 257 passed, 0 failed.
