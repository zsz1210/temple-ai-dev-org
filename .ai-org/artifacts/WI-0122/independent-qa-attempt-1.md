# Independent QA attempt 1 — WI-0122

## Verdict

**FAIL** for candidate `3c35ddf8c9603ca997d572a240cbcc1dce2c0541`, reviewed through clean handoff revision `94d123ef5536d735161e3e7f366550b60ab41b46`.

Independent QA was performed as `agent-lulu`; the Developer was `agent-rikku`.

## Release-blocking findings

### Valid Execution Requests can generate invalid Routes — medium

The Request schema and `validateExecutionRequest` accepted capability values such as `INVALID/CAPABILITY`. The resolver copied them into required, optional, and unknown Route capability fields, after which both managed Route schema validation and `validateExecutionRoute` rejected the generated document. Independent QA reproduced this for required and optional capabilities.

### Direct semantic validation is not total — medium

Malformed `resource_observations` values of string, object, or number caused `validateExecutionRoute` to throw a `TypeError` instead of returning validation errors. Catalog validation was protected by Ajv ordering, but direct callers were not.

## Residual API-contract risk

Arbitrary `policySource` or invalid `generatedAt` resolver option overrides can create schema-invalid Route output even though the semantic validator accepts it. The normal CLI path supplies valid values, but the exported resolver boundary remains open.

## Passing evidence

- Independent matrix at `2026-09-03T03:56:31Z`: 23 positive resolver outputs passed; all 21 prior negative variants and 6 new mandatory negative cases behaved as expected.
- Focused suite, `2026-09-03T03:56:48Z` through `2026-09-03T03:56:53Z`: 19 passed, zero failed.
- Full `npm run verify`, `2026-09-03T03:56:56Z` through `2026-09-03T03:58:04Z`: 327 passed, zero failed, skipped, cancelled, or TODO.
- Schema validation at `2026-09-03T03:58:15Z`: 146 documents across 33 schemas passed.
- Doctor: 36 pass, one unrelated stale-plan warning, zero fail.
- Installed and overlay schemas matched SHA-256 `97b2f77fbd1811e39c2d4b346b1f9fa9f74398ead0b9f21ca4609586b371013d`.

## Boundary

Overall QA window: `2026-09-03T03:54:12Z` through `2026-09-03T03:59:27Z`. Independent QA was read-only. No repository, lifecycle, Provider, Git, or external mutation occurred during the review.
