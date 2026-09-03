# Developer report — WI-0122

## Outcome

Candidate `3c35ddf8c9603ca997d572a240cbcc1dce2c0541` reconciles pinned reason precedence with actual resolver output and closes the two remaining low-severity validation gaps.

- Pinned requests with unknown required capabilities remain unresolved, non-fallback, and unselected while retaining `pinned-profile-not-found` or `pinned-profile-ineligible`.
- Advisory and shadow requests with unknown required capabilities continue to require `unknown-required-capability`.
- Resource observation sources must contain non-whitespace text.
- Resolved non-pinned results require either rule provenance or an explicit fallback.
- Both managed schemas remain byte-identical and semantic validation enforces the same cross-field contract.

## Verification

- Focused route and installation suite: 19 passed, zero failed.
- Full `npm run verify`, `2026-09-03T03:51:47.810Z` through `2026-09-03T03:52:55.224Z`: repository checks, documentation links, package boundary, and 327 tests passed with zero failures, skips, cancellations, or TODOs.
- Installed and overlay schema SHA-256: `97b2f77fbd1811e39c2d4b346b1f9fa9f74398ead0b9f21ca4609586b371013d`.

An earlier pre-candidate full run observed one unrelated Console refresh timeout. Its isolated suite immediately passed 8/8, and the exact committed candidate then passed the full 327-test run including that test. The passing exact-candidate run is the qualifying evidence; the timeout is retained here rather than hidden.

## Boundary

No Provider call, model execution, automatic routing, external mutation, push, merge, deployment, publication, or release occurred.
