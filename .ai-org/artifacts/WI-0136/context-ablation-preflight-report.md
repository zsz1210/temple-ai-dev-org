# Context-recovery qualification v9 preflight

## Result

V9 is locally ready. Model generation remains disabled because the corrected protocol requires a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `6ad30fd488aa57c0bc3318161a2f00b7cb7ade97b20e1fcbaffedc5bd0e81715`
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
- Preflight passes all 42 non-approval checks. Its only blocker is `exact-human-approval-required`.
- The focused experiment test file passes all 18 tests, including schema, prompt-order, successful-command observation, and zero-generation telemetry cases.
- Full repository verification passes all 377 tests after repository, documentation-link, and package-boundary checks.

## Why v9 exists

The exact-approved v8 attempt completed both candidates, but the full-load candidate looked for `TEMPLE.md` in the experiment root rather than `coordinator/TEMPLE.md`, reported the required entrypoint missing, and performed no equivalent recovery. V8 also revealed that treatment telemetry counted attempted commands without checking their exit status.

V9 uses unambiguous root-relative paths, supplies the pinned local Temple CLI path to the isolated runtime, and admits only successful command completions into the observed context sequence. Generation-free preflight now runs the exact context command in both condition roots instead of assuming that the launcher works.

The v8 protocol, approval, preflight, raw stop, and explanatory report remain preserved as immutable evidence. V9 keeps the same models, reasoning request, fixture shape, condition ceilings, total ceiling, wall-clock ceiling, retry policy, and fallback policy; it changes the prompt contract, runtime fixture wiring, observation semantics, and fixture revision.
