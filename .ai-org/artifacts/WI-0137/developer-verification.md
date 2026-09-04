# WI-0137 Developer verification

- Candidate revision: `94d8ceb987ecce2bd444c2ca98209fd4f1a6f66d`
- Position: Developer
- Agent Identity: Rikku (`agent-rikku`)
- Result: pass

## Implemented

- Context Map v2 with optional lifecycle-stage and primary, integration, or recovery purpose constraints.
- Context Map v1 runtime and JSON Schema compatibility without rewriting project-owned files.
- Context Capsule v2 route metadata, explicit `TEMPLE.md` fallback policy, and a body-free source manifest.
- Streaming SHA-256 and byte measurement for safe regular files with symlink and repository-boundary rejection.
- CLI `--stage` and `--purpose` inputs plus human-readable manifest totals and selection digest.
- Fresh-project Context Map v2 seed and mirrored managed schemas in the distribution overlay.
- Human documentation and ADR-0047.

## Verification

- `npm run verify`: 400/400 tests passed; repository checks, documentation links, and package boundary passed.
- `node --test test/context.test.mjs test/representative-microservice-comparison.test.mjs`: 51/51 tests passed at the exact candidate revision.
- Self-host Doctor after managed-checksum refresh: 36 pass, 1 existing stale-plan warning, 0 fail.
- Context Map and Context Capsule schemas are byte-identical between the self-host installation and project overlay.

## Acceptance coverage

- Default stage and explicit stage/purpose routing: covered.
- Stage and purpose exclusion with explicit pinned-route warnings: covered.
- Stable and content-sensitive selection digest: covered.
- No source bodies retained: covered by schema and tests.
- Missing, symlinked, and unsafe sources fail closed: covered.
- Single-repository legacy compatibility and component-scoped integration selection: covered.

## Remaining evidence boundary

This verifies behavior and compatibility; it does not prove Token savings. A later controlled cold-handoff comparison must measure Provider-reported uncached input, cached input, output, latency, recovery accuracy, and human questions against the previous route.
