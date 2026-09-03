# Independent QA attempt 1 — WI-0123

## Verdict

**FAIL** for candidate `4263bc7d533be072191e39bd6f959eebb77f271d`, reviewed through clean handoff revision `ecbea0a2cb8f34a4e6e1420e2a448e131da65a58`.

Independent QA was performed as `agent-lulu`; the Developer was `agent-rikku`.

## Release-blocking findings

### Expanded-year timestamps escape the Route schema — medium

JavaScript timestamps with signed six-digit years round-trip through `Date.toISOString()` and therefore passed candidate option validation, but the managed Ajv date-time format rejected the emitted Route. Reproductions included years `+010000`, `-000001`, and `+275760`.

### Nested Request extras leak into Route output — medium

`validateExecutionRequest` accepted unknown properties in Task Shape, resource-limit, and resource-observation objects. Resolver object spreading copied those properties into the Route, where the managed schema rejected them. Managed Request Ajv already rejected the same inputs, so semantic and schema Request boundaries disagreed.

## Passing evidence

- 16 invalid capability cases rejected at Request Ajv, semantic Request validation, and resolver entry.
- 6 mandatory malformed resource collection cases and 23 broader direct-validator probes returned without throwing.
- 17 invalid option cases failed before output; 7 ordinary valid/default option sets passed.
- 23 positive Route outputs passed; all 21 retained WI-0121 and 32 structural adversarial variants behaved correctly.
- Focused suite, `2026-09-03T04:09:40Z` through `2026-09-03T04:09:44Z`: 22 passed.
- Full `npm run verify`, `2026-09-03T04:09:47Z` through `2026-09-03T04:10:56Z`: 330 passed.
- Schema validation: 147 documents across 33 schemas passed. Doctor: 36 pass, one unrelated stale-plan warning, zero fail.

## Boundary

Overall QA window: `2026-09-03T04:06:41Z` through `2026-09-03T04:12:51Z`. Independent QA was read-only and performed no repository, lifecycle, Provider, Git, or external mutation.
