# Alpha.25 policy evaluation and usage attribution

- Work Item: `WI-0010`
- Candidate revision: `7052388e4197ef1654e30ab33576ac6bb80d81d7`
- Result: passed with retained Phase 4B limits
- External release: not performed

## What was validated

Alpha.25 adds a managed seven-scenario adversarial catalog, a fail-closed policy evaluator, bounded provider-usage attribution, and an unknown-safe baseline report. The implementation was verified at the exact candidate revision in both the development checkout and a fresh detached Independent QA worktree.

| Check | Observed result |
|---|---|
| Repository and documentation integrity | Passed for 90 overlay files and 10 Positions |
| Full behavioral suite | 157 passed; 0 failed, skipped, or todo |
| Solo fixture | 7/7 scenarios passed |
| Collaborative fixture | 7/7 scenarios passed |
| High-Assurance fixture | 7/7 scenarios passed |
| Negative evaluation cases | Escaped, missing, unknown, failed-check, missing-evidence, and undeclared-side-effect cases failed closed or remained incomplete |
| Usage aggregation | Provider last-turn deltas aggregated; cumulative totals were not double-counted |
| Missing numeric usage | Reported as `null`/unknown, never zero |
| Price and model routing | Monetary cost unknown; recommendations and automatic routing disabled |
| Lifecycle and external authority | No gate advancement, external action, spending action, notification, or model switch |

## Self-host observation

The retained Temple Control Plane journal contained no provider usage observations. `temple usage report --no-write` therefore returned `insufficient-data`, zero observations, an unknown Token total, unknown monetary cost, and disabled automatic routing. This is the required truthful outcome; it is not evidence of zero Token use.

## Evidence boundary

The three profile fixtures prove deterministic evaluator behavior and the declared policy contract. They do not prove that a real organization handled these scenarios correctly. Generated policy and usage views remain disposable projections and cannot satisfy lifecycle gates.

## Remaining Phase 4B evidence

- Complete at least ten varied real Work Items without relying on chat history as authority.
- Establish a longitudinal Token, time, retry, handoff, and rework baseline before claiming improvement.
- Exercise representative live Solo, Collaborative, and High-Assurance operations, including interruptions and provider degradation.
- Evaluate recommendations against quality and outcome evidence before considering user-approved routing.
- Retain price-source governance, spending authority, production notification, and external-system writes as separate future decisions.

Phase 4B remains open until this evidence is reproducible; Alpha.25 ships its measurement and evaluation foundation only.
