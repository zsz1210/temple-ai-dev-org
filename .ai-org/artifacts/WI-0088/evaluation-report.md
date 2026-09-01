# WI-0088 Evaluation Report

## Acceptance evaluation

| Acceptance criterion | Evidence | Decision |
| --- | --- | --- |
| Live Console renders and navigates at 390x844, 768x1024, 1440x1000, and 3440x1440 without document overflow, clipped primary text, or named high-level overlap | Exact-candidate Chrome run in `.ai-org/artifacts/WI-0088/quality-test-observation.json` | Pass |
| Runtime errors, primary navigation, mobile sidebar, organization keyboard tabs, reduced motion, and failure screenshot behavior are gated | Live Chrome run plus `test/console-browser-contract.test.mjs`; the first development run exercised the bounded failure artifact before the timing correction | Pass |
| Playwright Core is exact, Apache-2.0, development-only, and does not add a browser binary to runtime or the package | `package.json`, `package-lock.json`, `THIRD_PARTY_NOTICES.md`, and successful package-boundary check | Pass |
| CI uses the existing Node.js 24 full lane, aggregates the result, and adds no job | Workflow contract test and direct `.github/workflows/ci.yml` inspection | Pass for checked-in behavior; hosted execution remains unobserved until an authorized push |

## Risk and value evaluation

- The gate targets the concrete defect classes the user observed: compressed regions, malformed responsive navigation, clipping, and browser-only runtime behavior.
- Semantic contracts are less brittle than pixel baselines and therefore avoid recurring false failures from dynamic repository data.
- The browser adds one local Chrome launch only to an already billed Node.js 24 full job. It does not duplicate the Node.js 22 lane and does not run for documentation-only or evidence/state-only scopes.
- A fresh Node.js 24 run completed the full suite in 50.9 seconds; the separate local browser run completed four viewports and 24 view traversals. Hosted timing and billed allowance remain unknown until a real run and must not be invented.

## Residual limitations

- This proves installed Chrome only, not Safari, Firefox, or mobile-device rendering.
- Semantic geometry and interaction checks do not replace human visual-quality review.
- GitHub runner image changes may alter the installed Chrome version; the harness reports the actual version and fails rather than silently skipping.
- The Alpha.29 candidate predating this dependency change is stale.

## Evaluation decision

Pass. Advance the exact candidate to Independent QA. Do not claim hosted CI cost, cross-browser support, public-release readiness, or restoration of the prior Alpha candidate.
