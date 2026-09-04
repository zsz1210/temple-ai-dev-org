# Context-recovery qualification v10 preflight

## Result

V10 is locally ready. Model generation remains disabled because the corrected protocol requires a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `f1a3da3550d5751581a049e0e17085948517eea5caa8b40c63e744c495fef33f`
- Conditions: Terra medium routed context, then Terra medium full-load context
- Operational-Token hard stops: 80,000 routed; 120,000 full-load; 200,000 combined
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Network and external actions: disabled
- Account boundary: Pro included allowance only; no Credits purchase, automatic refill, or usage reset

These are safety ceilings, not expected consumption, price, or permission to purchase capacity. The routed ceiling remains above the 53,823 Operational Tokens observed in the completed v5 Terra routed condition. The full-load ceiling remains the evidence-backed 120,000 introduced in v5.

## Generation-free checks

- Both conditions contain identical Gateway, Catalog, Orders, Notifications, and Coordinator Git revisions and trees.
- Gateway, Catalog, Orders, and Notifications are at `test`; Coordinator is at `build`, ready for fresh recovery.
- The prepared implementation passes the service, public-integration, and held-out compatibility checks.
- Participant Doctor checks pass.
- The installed `codex-cli 0.151.0-alpha.7.2` App Server contract and Terra medium route match the frozen Provider contract.
- The exact output schema passes the local `openai-structured-outputs-subset/2026-09-03` check: 8 object properties, 3 enum values, 4 nesting levels, and no unsupported keyword.
- The exact root-relative context command succeeds in both matched condition fixtures and returns the expected Context Capsule for WI-0001 and the Developer Position.
- `coordinator/TEMPLE.md` is readable in both matched condition fixtures.
- The exact repository-scoped `git -C <fixture> rev-parse HEAD` form passes the command policy for all five fixture repositories in both conditions.
- Traversal targets and unapproved Git subcommands remain rejected by focused tests.
- Preflight passes all 52 non-approval checks. Its only blocker is `exact-human-approval-required`.
- The focused experiment test file passes all 19 tests, including schema, prompt-order, successful-command observation, scoped Git policy, and zero-generation telemetry cases.
- Full repository verification passes all 378 tests after repository, documentation-link, and package-boundary checks.

## Why v10 exists

The exact-approved v9 attempt successfully delivered and observed both context treatments. Its routed candidate completed correct recovery, while its full-load candidate was stopped after treatment because the command policy rejected the ordinary read-only form `git -C gateway rev-parse HEAD`.

V10 adds only fixture-bounded `git -C` variants of the already allowed read-only Git subcommands. It does not permit arbitrary directories, mutation commands, network access, shell control operators, retries, or fallback. Preflight and focused tests verify both the accepted and rejected boundaries.

The v9 protocol, approval, preflight, raw stop, and explanatory report remain preserved as immutable evidence. V10 keeps the same models, reasoning request, context treatments, condition ceilings, total ceiling, wall-clock ceiling, retry policy, and fallback policy; it changes the command-policy contract and fresh matched-fixture revision.
