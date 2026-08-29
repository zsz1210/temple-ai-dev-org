# Alpha.13 Collaborative foundation validation

- Date: 2026-08-29
- Version: `0.1.0-alpha.13`
- Tested revision: `233d406d4aaa1017873606e8973e26798ba87950`
- Environment: macOS 26.5.2, arm64, Node.js v25.6.1
- Result: **local automated foundation passed; large-scale real-environment validation not run**

## Question

Can a clean or upgraded repository preserve the existing Solo workflow while adding project-owned Human Principals, Agent sponsorship, Position pools with Disciplines, collision-resistant Collaborative Work Item IDs, dependency and overlap checks, Principal-backed claims, Agent Session attribution, and observable pending large-scale validation?

## Commands

```bash
npm run verify
git status --short
git rev-parse HEAD
```

`npm run verify` executed repository policy checks and the complete Node test suite against the exact tested revision.

## Observed evidence

- Repository checks passed with 53 installed-overlay files and all ten Positions.
- All 47 automated tests passed.
- Existing Solo lifecycle, handoff, closeout, task registry, optional packs, learning, context routing, upgrade rollback, and managed-file protection remained green.
- Clean initialization created project-owned `collaboration.json` and installed the retained large-scale test-plan template.
- Upgrade created missing collaboration state without adding it to managed ownership and synchronized only the default memberships that mirror project Assignments.
- Collaborative mode allocated a date plus random-suffix Work Item ID.
- A Human Principal added and sponsored an additional Agent Identity.
- That Agent joined the Developer Position with the backend Discipline, became the planned Agent after the item reached Build, passed readiness, claimed the item with base revision, branch, and worktree, registered a Codex task with Principal and claim provenance, and released the claim.
- Parallel readiness rejected unresolved affected-path overlap as sequential guidance.
- Dependency-cycle configuration was rejected without leaving the rejected mutation behind.
- Doctor accepted pooled task ownership, checked collaboration consistency and claims, and retained a warning that the large multi-human, multi-machine test has not passed.
- Status v4 reported the profile, Principal, sponsorship, membership, active-claim, parallel-mode, task-session provenance, and `not_run` validation state.

## Supported claim

Alpha.13 provides a backward-compatible, repository-native Collaborative foundation and deterministic local safety checks. The diagrams and operating guide describe how Human Principals, Agent Identities, Position Memberships, Work Assignments, claims, Git branches, evidence, and lifecycle gates fit together.

## Explicitly unsupported claim

This validation does not prove distributed locking, real multi-human coordination, multiple physical machines, Git-hosting rules, pull-request contention, merge-queue behavior, large-repository performance, company adoption, or High-Assurance governance. Those conditions remain in the [Collaborative large-scale real-environment test plan](collaborative-large-scale-test-plan.md), whose status is `planned / not run`.

