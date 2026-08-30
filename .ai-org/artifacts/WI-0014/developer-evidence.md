# Developer evidence — WI-0014

- Position: Developer
- Agent Identity: Rikku
- Developer revision: `a172ecec36b84a58db499848f16351c317173f49`
- Integrated candidate revision: `23768e74ceb35a15589e194e0929f70914e8f407`
- Result: pass to Quality & Evaluation

## Verification

- The registered Developer task ran from `2026-08-30T06:49:21Z` through `2026-08-30T06:59:01Z` and left its branch clean.
- `node --test test/phase-4b.test.mjs` passed 8 tests with zero failures, skips, or todos.
- `npm run verify` passed repository checks, documentation-link checks, and all 165 tests with zero failures, skips, or todos.
- Mog cherry-picked the single implementation commit onto the canonical main history without conflicts; the resulting exact integrated candidate is `23768e74ceb35a15589e194e0929f70914e8f407`.

## Delivered behavior

- The read-only usage report now separates canonical Work Item coverage, registered-task coverage, task eligibility, detailed observation coverage, and qualification gaps.
- An observation correlates only when both its task ID and Work Item ID match one canonical registered pair.
- Each Token field independently reports `observed`, `partial`, or `unknown`; unsupported totals remain `null`.
- Coverage is deterministically ordered and preserves `--no-write` behavior.
- Savings, monetary cost, model-quality, and routing claims remain disabled.

## Retained limit

The first live Developer-task attempt remained registered and live-resumable, but the Codex Provider degraded with `thread/resume failed (-32600)`. It produced no detailed observation, so all Token totals remain unknown. This is a provider/host bridge limit, not a successful measurement.

## Rollback

Revert integrated candidate `23768e74ceb35a15589e194e0929f70914e8f407`. Canonical Work Items and task records remain separate from the generated usage projection.
