# Developer report — WI-0120

## Outcome

Candidate `486c64df3006e6e8df6c3dd6d51a8a6e29c9843d` repairs the Execution Route validation boundary found by post-close Independent QA.

- Both managed `temple.execution-route/v1` schema copies now define every nested object, property type, enum, nullability rule, conditional state, and `additionalProperties` boundary.
- V1 authority remains non-executing. Effective Provider, model, and reasoning values can only be `null` with status `unobserved`.
- `validateExecutionRoute` checks summary counts, step and candidate identity uniqueness, selection-mode authority, resolved/selected/eligible consistency, capability-subset reporting, disjoint eligibility, and per-step resource identity.
- Cataloged generated route documents pass through JSON Schema and the semantic validator.
- The exact malformed shapes found by Independent QA—numeric ID, string Task Shape, invented executed/automatic states, claimed effective model, unavailable zero, and unexpected command—are retained as rejection tests.
- Structurally valid but contradictory summaries, authority, eligibility, capability reports, and duplicate resource identities are also rejected.

The resolver output shape, project-owned execution policy, provider-neutral distribution, installation ownership, CLI no-write behavior, and core Position catalog are unchanged.

## Verification

- Focused route and installation suite: 19 passed, zero failed.
- Full `npm run verify`, `2026-09-03T03:21:03.193Z` through `2026-09-03T03:22:11.658Z`: repository checks, documentation links, package boundary, and 327 tests passed with zero failures, skips, cancellations, or TODOs.
- The managed and overlay schema bytes are identical and compile with Ajv 2020.

## Boundary

No Provider call, model execution, task launch, project-policy rewrite, push, merge, deployment, publication, or release occurred. WI-0119 history was not rewritten; its post-close failure is retained as WI-0120 input evidence.
