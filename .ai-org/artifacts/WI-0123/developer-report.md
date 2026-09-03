# Developer report — WI-0123

## Outcome

Candidate `4263bc7d533be072191e39bd6f959eebb77f271d` closes the exported Execution resolver input domain.

- Request required and optional capabilities now use the Route identifier grammar in both managed schema and semantic validation.
- Invalid capability IDs fail before resolution.
- Explicit resolver policy source is limited to the three Route-schema values.
- Explicit generation time must be a canonical UTC ISO-8601 instant.
- Malformed resource collections produce validation errors without throwing.
- All earlier Route precedence, provenance, string, capability, authority, and mapping regressions remain covered.

## Verification

- Focused route and installation suite: 22 passed, zero failed.
- Full `npm run verify`, `2026-09-03T04:04:13.381Z` through `2026-09-03T04:05:24.585Z`: repository checks, documentation links, package boundary, and 330 tests passed with zero failures, skips, cancellations, or TODOs.
- Installed and overlay Request schema SHA-256: `be8bcea41d700ad0a6088a26d85f7ee7c591fa21968f998a9624221cdb813d9b`.

## Boundary

No Provider call, model execution, automatic routing, external mutation, push, merge, deployment, publication, or release occurred.
