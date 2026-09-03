# Independent QA attempt 1 — WI-0121

## Verdict

**FAIL** for candidate `a8eea7c3122dfac1ce7cf700a083030bb79bf01d`, reviewed through clean handoff revision `847c82f633f65cc70423bf3c256a56d6637e24f7`.

Independent QA was performed as `agent-lulu`; the Developer was `agent-rikku`.

## Release-blocking finding

### Resolver and validator disagree for pinned routes with unknown required capabilities — medium

The resolver emits `pinned-profile-ineligible` or `pinned-profile-not-found` for a pinned request whose required capability is unknown. The candidate schema and semantic validator simultaneously require pinned-specific reasons and require every non-empty `unknown_required` list to use `unknown-required-capability`.

Two real resolver outputs—one with an existing pinned profile and one with a nonexistent pinned profile—were therefore rejected by both the managed Ajv schema and `validateExecutionRoute`. The intersection needs one explicit precedence rule; the current contract is internally contradictory.

## Additional findings

- **Low:** whitespace-only `resource_observations[].source` passed both validation layers even though it carries source meaning.
- **Low:** a non-pinned resolved route with `rule_id: null` and `fallback_applied: false` passed both layers even though the resolver cannot emit that combination.

## Passing evidence

- Independent adversarial matrix at `2026-09-03T03:43:28Z`: all 21 variants covering the nine retained bypass classes failed closed; all 6 required positive fixtures passed both layers.
- Focused suite, `2026-09-03T03:43:49Z` through `2026-09-03T03:43:53Z`: 19 passed, zero failed.
- Full `npm run verify`, `2026-09-03T03:43:57Z` through `2026-09-03T03:45:05Z`: 327 passed, zero failed, skipped, cancelled, or TODO.
- Schema validation, `2026-09-03T03:45:28Z` through `2026-09-03T03:45:29Z`: 145 documents across 33 schemas passed.
- Doctor, `2026-09-03T03:45:34Z` through `2026-09-03T03:45:58Z`: 36 pass, one unrelated stale-plan warning, zero fail.
- Installed and overlay schemas were byte-identical at SHA-256 `f65da8560206c865115b0e3aea21a1303b4036a073ae9fb7e5a03fdf961e97ec`.

## Boundary

Overall QA window: `2026-09-03T03:41:07Z` through `2026-09-03T03:46:06Z`. Independent QA was read-only. No repository, Temple lifecycle, external, Provider, push, merge, deployment, publication, or release mutation occurred during the review.
