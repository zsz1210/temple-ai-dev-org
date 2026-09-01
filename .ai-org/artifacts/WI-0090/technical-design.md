# WI-0090 Technical Design

## Candidate construction

Use `fadd4a5e36f90ad1e683546b6e0f9e5374c72e33` as the integration baseline. Reconcile only the release-facing documents and WI-0090 evidence needed to describe the already completed changes. Commit that reconciliation once so all technical checks can bind to one exact candidate revision.

## Verification matrix

1. Run the repository's complete `npm run verify` gate.
2. Run the installed-Chrome semantic browser gate with `npm run test:browser`.
3. Inspect the allowlisted npm tarball, audit both the production and complete locked dependency graphs, and confirm license notices.
4. Install the exact tarball into clean temporary consumers under Node.js 22 and 24; verify version, init, re-init, project launcher, status, and Doctor.
5. Push the exact candidate to private `origin/main`; require the hosted Node.js 22 and 24 jobs to pass, including the browser gate only in the Node.js 24 full lane.

## Evidence and closeout

- Developer and Quality evidence must name the exact candidate revision and actual command results.
- Independent QA uses `agent-lulu`, distinct from Developer `agent-rikku`.
- The Release Manager may close WI-0090 as an internal candidate integration only. `external_release_status` remains `not_performed`.
- Governance-only evidence recorded after the technical candidate is pushed separately and must remain green; the immutable release candidate remains the tested technical revision.

## Ownership and rollback

The package does not include repository Work Items, validation evidence, tests, or user-owned browser output. If the private integration is invalid, revert the WI-0090 reconciliation and the already identified WI-0088/WI-0089 commit ranges with ordinary reviewed Git reversions; never rewrite shared history or delete project-owned state.
