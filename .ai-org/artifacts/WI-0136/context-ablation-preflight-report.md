# Context-recovery qualification v7 preflight

## Result

V7 is locally ready. Model generation remains disabled because the corrected protocol requires a new exact account approval.

## Frozen boundary

- Protocol SHA-256: `5f20f1143394b4e0b6cc19d2a8736029ca4c54e361b93a04310556ec75d6f92d`
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
- The focused experiment test file passes all 17 tests, including the `uniqueItems` regression and zero-generation telemetry cases.
- Full repository verification passes all 376 tests after repository, documentation-link, and package-boundary checks.

## Why v7 exists

The exact-approved v6 attempt stopped before generation with zero Operational Tokens because its strict schema used unsupported `uniqueItems`. V6 produced no candidate result. It also exposed a telemetry bug that labelled the zero-generation stop as generated.

V7 removes only that unsupported keyword. Exact slice values remain constrained by enum, and array length remains exactly three; the deterministic evaluator still rejects duplicates or missing slice IDs. Protocol validation, freeze, and preflight now validate the exact output schema without model generation. The stopped-run recorder now reports `model_generation_performed: false` when no condition and no Token usage were observed.

The v6 protocol, approval, raw stop, and explanatory report remain preserved as immutable evidence. Official schema basis: <https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas>.
