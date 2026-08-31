# WI-0065 developer report

## Completed

- Added explicit requested-turn, observed-thread, and effective-turn reasoning fields to task registration and updates.
- Kept `reasoning_effort` as a source-labelled compatibility projection for legacy consumers.
- Updated Provider-owned launch registration, launch results, usage attribution, live projections, Doctor validation, schemas, CLI options, and Team cards.
- Added contract coverage for a `max` turn request with an `xhigh` thread response and no turn-effective acknowledgement.
- Added a generated-dashboard JavaScript syntax check after the runtime review caught a missing parenthesis that module syntax checks could not see inside the HTML template.
- Synchronized the self-host `temple.lock` digest for the changed managed task schema after exact-candidate Doctor detected the stale checksum.
- Updated human-facing operational documentation and the project glossary.

## Verification

- Focused control-plane and usage tests: pass.
- Full repository verification after the visual syntax correction and regression test: 234/234 pass.
- Post-correction focused tests: 32/32 pass.
- Runtime visual review: pass at 1720 × 1000 and 390 × 844 with zero console errors.
- Exact-candidate verification and Independent QA remain required after the candidate commit.

## Remaining protocol limit

The installed App Server still exposes no direct effective-turn reasoning value. Temple now reports that absence truthfully; this Work Item does not change the Provider protocol or enable automatic routing.
