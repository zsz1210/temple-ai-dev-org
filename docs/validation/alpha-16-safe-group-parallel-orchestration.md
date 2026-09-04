# Alpha.16 safe group parallel orchestration validation

- Version: `0.1.0-alpha.16`
- Feature revision: `80e97fb94cb25b696af047c1de9dd2f47f8b6b45`
- Date: 2026-08-30
- Environment: macOS 26.5.2 (25F84), arm64, Node.js 25.6.1, npm 11.11.0
- Result: Passed with explicit runtime and distributed-coordination limits

## Scope

This record validates Temple's local, plan-only orchestration contract for a decomposed group of Work Items. It covers deterministic safe waves, selected dependencies, affected-path conflicts, optional worker limits, explicit dispositions, source-fingerprint freshness, plan tamper detection, Context Capsule routing, status and doctor observation, installation, upgrade, packaging, and the `$temple-work` Skill contract. It does not claim that the CLI created or executed Codex tasks, coordinated separate machines, or proved semantic merge safety.

## Commands and results

```text
node --check src/orchestration.mjs
node --check src/cli.mjs
node --check src/status.mjs
node --check src/context.mjs
node --check src/doctor.mjs
node --test test/orchestration.test.mjs
npm run verify
uv run --with pyyaml python /path/to/codex/skills/.system/skill-creator/scripts/quick_validate.py project-overlay/.agents/skills/temple-work
npm pack --dry-run --json
git diff --check
```

Observed results:

- Repository checks passed with 63 overlay files and all 10 Positions.
- The focused orchestration suite passed 6 of 6 tests.
- The complete suite passed 80 of 80 tests with no skips or failures.
- The official Skill validator reported `Skill is valid!` for `$temple-work`.
- Package dry-run reported version `0.1.0-alpha.16` and 162 files. It included `src/orchestration.mjs`, the managed parallel-plan schema, the public guide, ADR-0021, and the focused test suite.
- `git diff --check` reported no whitespace errors before the feature commit.

## Behaviors exercised

1. Parent-scoped planning recursively selects non-terminal descendants while repository-wide planning considers every active Work Item.
2. Selected dependencies enter later waves; terminal dependencies are already satisfied; missing, active, outside-scope, and otherwise unavailable dependencies remain explicit blockers.
3. Unresolved affected-path overlap separates Work Items into different waves. A same-wave exception requires both items to name the exact conflicting Work Item ID.
4. An unclaimed parent used only as a coordination outcome does not block its children through a broad path declaration; an active overlapping ancestor remains execution work and is not ignored.
5. `--max-workers` bounds every wave. Without it, the manifest records no artificial CLI capacity while retaining a sequential fallback for runtimes without concurrent workers.
6. Preparation gaps and explicit sequential mode produce a `sequential` disposition; unstable contracts, stale or unapproved specifications, unresolved items, dependency cycles, and explicit blocked mode produce `blocked` reasons.
7. Dispatch entries include the Work Item, Position, planned Agent, suggested task title, base revision, paths, dependencies, Disciplines, Integration Owner, and a bounded Context Capsule command.
8. Every manifest records that task creation, claims, and external actions were not performed. Planning leaves the task registry and Work Item claims unchanged.
9. The generated plan is deterministic for the same canonical state. Canonical changes mark it stale, and a structurally valid manual edit is rejected when it differs from the deterministic projection.
10. Status v7 exposes plan validity, freshness, dispositions, waves, and the next safe wave. Doctor emits rebuildable warnings for stale or invalid plans. Context Capsules include the current Work Item's disposition and wave.
11. Every wave carries an Integration Owner join gate for exact candidate revisions, verification results, and unresolved items. Documentation and installed instructions require replanning after the join.
12. Initialization and upgrade expose the group-planning, dispatch-manifest, freshness, and join-gate capability flags without making the CLI a task runtime.

## Evidence boundary

The tests used local temporary repositories and deterministic process-level CLI calls. They did not create real Codex tasks, dispatch multiple live Agent workers, exercise concurrent work on separate machines, operate a production branch-protection or CI policy, or perform a real multi-human integration join. A declared path boundary and bidirectional overlap record remain coordination evidence, not proof that two code changes merge semantically.

The retained large multi-human, multi-machine validation remains `not_run`. It should test real task creation and registration, Principal-backed claims, concurrent pull requests, runtime capacity changes, integration-owner joins, stale-plan recovery, CI evidence, and human conflict resolution in a low-risk project before a high-assurance claim is made.

## Release conclusion

Alpha.16 is suitable for low-risk repository pilots that need an inspectable first safe wave and a deterministic sequential fallback. Only the first wave of a valid, fresh plan is an immediate dispatch candidate. The release is not evidence for autonomous task creation, distributed locking, automatic merging, or high-assurance multi-team operation.
