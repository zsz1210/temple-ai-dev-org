# Phase 4C multi-repository federation implementation

- Work Item: `WI-0018`
- Scope: isolated Developer implementation
- Result: focused implementation checks passed
- External actions: none

## Implemented behavior

The implementation supplies a project-owned participant registry contract, exact composite Work Item references, versioned Initiatives and dependencies, API and event contract references, explicit compatibility, ordered rollout waves, and a bounded read-only portfolio.

Participant reads fail closed to `unknown` for missing repositories, unsafe paths, stale pins, unavailable or mismatched revisions, dirty canonical state, invalid documents, and identity mismatch. Portfolio output omits credentials, principals, raw evidence bodies, artifact paths, business-source bodies, prompts, provider payloads, approvals, claims, and release decisions.

Status, capacity, evidence, risk, and usage are safe aggregate signals. Missing signal sources remain unknown. Usage is explicitly labeled as a generated projection, and no signal is presented as lifecycle authority. Overall completion remains unknown by construction.

## Developer verification

`node --test test/federation.test.mjs` passed five isolated scenarios:

1. bare and unpinned Work Item references are rejected;
2. secret-bearing registry fields, stale references, and incompatible contracts without rollout waves are rejected;
3. an incompatible API contract with consumer-first and producer-second waves resolves across two exact participant revisions;
4. missing, stale, invalid, identity-mismatched, dirty, revision-mismatched, and symlink-escaped participants remain unknown;
5. a truncated Work Item projection cannot make an omitted coordination reference current.

The multi-repository tests compute content hashes for every participant before and after portfolio generation. All hashes remained identical. Tests also place credentials, worker and principal IDs, raw evidence text, artifact paths, business-source text, and provider payloads in participant fixtures and confirm none appear in the portfolio.

`npm run verify` also passed repository checks, documentation-link checks, and all 170 tests with zero failures, skips, or todos in this Developer worktree.

## Evidence boundary

These are deterministic local fixtures, not evidence of a production federation or a real multi-human or multi-machine organization. Shared CLI installation, schema catalog registration, managed templates, lock capabilities, upgrade migration, and documentation indexes are intentionally outside this Developer branch and remain Integration Owner work. Independent QA must reproduce the exact integrated revision before any release or Phase 4C completion claim.
