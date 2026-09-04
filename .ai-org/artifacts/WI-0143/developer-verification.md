# WI-0143 developer verification

## Implementation

- Added an explicit WI-0143 experiment profile while retaining sealed WI-0141 as the default behavior.
- Isolated artifact and disposable-laboratory paths by supported Work Item ID and rejected unknown profiles.
- Reordered WI-0143 into four adjacent, treatment-counterbalanced matched blocks.
- Bound a predeclared two-percentage-point cache-share tolerance to the SHA-256 of the retained WI-0141 pilot observation.
- Bound the exact cache-control record into the approval template.
- Added human-intervention and rework fields to retained analysis and reporting.
- Added a human-facing validation method and commands.

## Deterministic evidence

- `node --check scripts/run-context-capsule-ablation.mjs`: passed.
- `node --test test/context-capsule-ablation.test.mjs`: 13 passed, 0 failed.
- `npm run verify`: 413 passed, 0 failed; repository, documentation-link, and package-boundary checks passed.
- `git diff --check`: passed.

The WI-0143 child-process test prepared and rehearsed the successor profile with a fixture Provider contract, then confirmed `exact-approval` was the only preflight blocker. It performed no model generation and wrote no WI-0143 live observation.
