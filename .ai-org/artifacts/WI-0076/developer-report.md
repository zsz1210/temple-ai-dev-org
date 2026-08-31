# Developer report — multi-human team governance

- Work Item: `WI-0076`
- Position: Developer
- Agent Identity: `agent-rikku`
- Base revision: `8d41f2bbe2d68e2540a7a000f733bcc3c44a3a50`
- Result: implementation complete; candidate verification pending exact revision registration

## Delivered

- Collaboration v2 with explicit v1 migration, immutable Principal lifecycle, duplicate-safe display names, append-preserving sponsorship, evidence-qualified Position Membership, scoped Human Authority Grants, temporary bootstrap retirement, configurable recovery, and five distinct validation gates.
- Clone-local actor binding at the Git common directory with mode `0600`, bounded verification provenance, no credential fields, and Collaborative/High-Assurance claim checks.
- CLI operations for migration, binding, personnel lifecycle, sponsorship, qualification, authority, recovery, bootstrap, and validation recording.
- Observer, status, assurance, and schema support for both v1 and v2, including qualification attention and truthful simulated-versus-real validation state.
- Server-side private-viewer redaction of Principals, sponsorships, detailed grants, trustee identities, and local binding.
- A read-only Team surface with Responsibilities, People & Agents, and Authority tabs; the former single Human Principal apex is removed.
- Alpha.28 version, migration, templates, documentation, changelog, and managed-overlay digests.

## Developer verification

- `node --test test/collaboration-governance.test.mjs test/workflow.test.mjs test/control-plane-foundation.test.mjs test/control-plane-private-viewer.test.mjs test/evidence-observer.test.mjs` — 54/54 passed.
- `npm run verify` — repository and documentation checks passed; 257/257 tests passed.
- The disposable two-clone scenario proves a non-fast-forward rejection, visible conflict, retained commits from both writers, and cold-clone recovery.
- Playwright at 1440 px and 390 px found no horizontal page overflow, no console errors or warnings, and successful ArrowRight tab navigation.

## Boundaries retained

- No provider-specific authentication, credential storage, distributed coordinator, remote mutation, deployment, package publication, or external release was added.
- The local multi-clone exercise is simulation. `real_collaborative`, `representative_pilot`, and `high_assurance_drill` remain `not_run`.
- Skill proposal and human activation policy is unchanged.

## Rollback

Revert the WI-0076 implementation and Alpha.28 metadata together. Existing collaboration v1 project files remain readable because the managed schema and runtime are dual-version; projects migrate to v2 only through the explicit CLI action.
