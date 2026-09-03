# Developer report — WI-0121

## Outcome

Candidate `a8eea7c3122dfac1ce7cf700a083030bb79bf01d` closes the nine validation bypasses retained by WI-0120 Independent QA attempt 1.

- Required and optional capabilities must be distinct, non-blank identifiers.
- A route with any unknown required capability must remain unresolved with the exact fail-closed reason.
- Requested Provider mappings are either entirely neutral or entirely concrete; partial and whitespace-only mappings are rejected.
- Work Item and Task Shape contract strings must contain non-whitespace content.
- Pinned selection cannot claim fallback, while non-pinned selection cannot use pinned-only unresolved reasons.
- Rejected-candidate reasons must contain non-whitespace content.
- The installed and distributable managed schemas apply the same structural rules, and semantic validation enforces the cross-field rules JSON Schema cannot express safely.

Valid mapped, Provider-neutral, pinned-unresolved, advisory, shadow, and project-owned media-extension routes remain accepted.

## Verification

- Focused route and installation suite: 19 passed, zero failed.
- Full `npm run verify`, `2026-09-03T03:36:37.210Z` through `2026-09-03T03:37:45.158Z`: repository checks, documentation links, package boundary, and 327 tests passed with zero failures, skips, cancellations, or TODOs.
- The installed and overlay schema bytes are identical with SHA-256 `f65da8560206c865115b0e3aea21a1303b4036a073ae9fb7e5a03fdf961e97ec`.

## Boundary

No Provider call, model execution, external mutation, push, merge, deployment, publication, or release occurred. The failed WI-0120 QA attempt remains preserved and is not overwritten by this repair.
