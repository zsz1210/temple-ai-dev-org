# Developer evidence — WI-0058

## Change

- Added a bounded, read-only archive usage loader that accepts only direct timestamp-named regular files.
- Projected normalized usage events into a strict Token-and-attribution schema, dropping arbitrary payload fields before aggregation.
- Combined active and archive observations by Provider `source` plus `id`, counted equal duplicates once, and excluded every conflicting identity.
- Added per-file failure isolation, file/count/line/total-byte limits, sanitized diagnostics, and immutable-archive caching.
- Connected the same archive-aware history to `usage report`, `usage preflight`, Control Plane snapshots, and Temple Workspace.
- Added concise complete/partial history copy to the existing responsive Usage view without changing routing, cost, or lifecycle authority.

## Deterministic verification

On exact candidate `31c78a2d7a523de6991c50de19db59235bc78166`:

- focused archive usage and Control Plane tests: 24 passed, 0 failed;
- full `npm run verify`: 232 passed, 0 failed;
- repository policy, documentation links, and `git diff --check`: passed;
- duplicate archive cursors were accepted without becoming global ordering authority;
- duplicate Provider identities counted once;
- conflicting identities counted zero;
- malformed matching JSON, oversized files, and symlinks were skipped without hiding valid active or archived usage;
- arbitrary `raw_prompt` and `tool_payload` fixture data did not enter the returned projection.

## Live self-host proof

The exact implementation restored the preserved `WI-0056` observation from local history without another Provider turn:

- total: `23,433` Tokens;
- input: `23,400`;
- cached input: `9,984`;
- output: `33`;
- reasoning output: `16`;
- model: `gpt-5.6-luna`, reasoning `max`;
- attribution: `WI-0056`, `task-0005`, Developer, Build;
- history: `complete`, one archived observation included, zero conflicts;
- both Repository and Codex Providers: `ready`.

The original archive digests still match `af32cd123e67beb0b0c128cc00306f13c128978c3e6e76cdf15eaae9d93da1` and `cc2933a36182a806740fc9bc804639e107c844d957358504b34cf5ac0b01384c` after the reads.

## Runtime visual review

Playwright verified the read-only home-LAN Usage view at `1440x1000` and `1024x768`. `23,433`, `WI-0056`, `gpt-5.6-luna`, and the restored-history explanation were visible; the responsive layout remained intact; the browser reported zero console errors and zero warnings.

## Boundaries

No model generation, Provider command, archive rewrite, active-journal rehydration, external mutation, release, publication, deployment, or push occurred. Historical telemetry remains observational and cannot satisfy a lifecycle gate.
