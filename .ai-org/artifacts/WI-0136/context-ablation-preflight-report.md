# Context-recovery qualification v8 preflight

## Result

V8 is locally ready. Model generation remains disabled because the corrected protocol requires a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `c0d4aaefd74419487fd7541f03c4fe1355661df24e1981d2a8897ee371510683`
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
- Preflight passes all 38 non-approval checks. Its only blocker is `exact-human-approval-required`.
- The focused experiment test file passes all 17 tests, including the `uniqueItems`, prompt-order, and zero-generation telemetry cases.
- Full repository verification passes all 376 tests after repository, documentation-link, and package-boundary checks.

## Why v8 exists

The exact-approved v7 attempt completed one objectively correct Terra routed recovery, then stopped because the observed command order was `temple-md`, `context-resolve`, `context-resolve`. The full-load condition did not run. V7 therefore produced no valid context-strategy comparison.

V8 states that this is a known bounded Work Item, places the condition-specific first action before any repository inspection, and distinguishes the treatment order explicitly: routed must call `context resolve` before reading `TEMPLE.md`; full-load must read `TEMPLE.md` before calling `context resolve`. Regression tests assert that both first actions appear before the instruction to inspect all four repositories.

The v7 protocol, approval, preflight, raw stop, and explanatory report remain preserved as immutable evidence. V8 keeps the same models, reasoning request, fixture shape, condition ceilings, total ceiling, wall-clock ceiling, retry policy, and fallback policy; it changes the prompt contract and fixture revision only.
