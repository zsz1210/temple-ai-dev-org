# Quality evaluation — WI-0120

## Result

Pass for candidate `486c64df3006e6e8df6c3dd6d51a8a6e29c9843d`.

## Acceptance evaluation

| Criterion | Evidence | Result |
| --- | --- | --- |
| Complete nested v1 schema | Every route object declares properties, required fields, types, enums, nullability, and `additionalProperties: false`; overlay and installed bytes match | Pass |
| Original malformed payload rejected | Numeric ID, string Task Shape, executed or automatic state, claimed effective model, unavailable zero, and unexpected command each fail the actual managed Ajv schema | Pass |
| Cross-field contradictions rejected | Pure semantic validation rejects false summary totals, mode-authority mismatch, ineligible selection, invalid unknown-capability subset, eligibility overlap, and duplicate resource identity | Pass |
| Catalog applies both layers | A generated route in the catalog path passes when valid and fails with semantic-keyword evidence after a structurally valid summary contradiction | Pass |
| Existing routing and ownership preserved | Provider-neutral and mapped policies, all hard filters, pinned/fallback, media extension, safe request files, init, upgrade, and project-owned policy preservation pass | Pass |
| Repository compatibility | Developer full run passed 327 tests plus repository, documentation-link, and package-boundary checks | Pass |

## Focused verification

`node --test test/execution-routing.test.mjs test/phase4-installation.test.mjs` ran from `2026-09-03T03:23:15.874Z` through `2026-09-03T03:23:20.046Z`: 19 passed, zero failed, skipped, or cancelled.

## Boundary

The evidence qualifies local validation of `temple.execution-route/v1`. It does not qualify real Provider compatibility, model quality, cost, automatic routing, deployment, publication, push, merge, or release.
