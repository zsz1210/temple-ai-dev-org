# Alpha.17 recoverable runtime coordination validation

- Version: `0.1.0-alpha.17`
- Feature revision: `7f2a2d97589d709b6728a77d8d22e62a48277d7b`
- Date: 2026-08-30
- Environment: macOS 26.5.2 (25F84), arm64, Node.js 25.6.1, npm 11.11.0
- Result: Passed with explicit distributed-coordination limits

## Scope

This record validates Temple's local recovery and claim-before-worker contract: a project-visible pinned launcher, lifecycle-stage Discipline and shared-resource requirements, capacity-aware waves, atomic worker preparation and rollback, distinct internal-subagent and user-task correlation, status and doctor observability, upgrade-safe project-owned state, and terminal resource release without forged lifecycle progress.

It does not claim distributed locking, real multi-human or multi-machine Git contention, automatic runtime creation, external actions, or High-Assurance readiness.

## Commands and results

```text
node --check src/bootstrap.mjs
node --check src/resources.mjs
node --check src/workers.mjs
node --check src/orchestration.mjs
node --check src/status.mjs
node --check src/doctor.mjs
node --test test/runtime-coordination.test.mjs
npm run verify
python quick_validate.py .agents/skills/temple-init
python quick_validate.py project-overlay/.agents/skills/temple-init
python quick_validate.py project-overlay/.agents/skills/temple-work
npm pack --dry-run --json
git diff --check
```

Observed results:

- Repository checks passed with 68 overlay files and all 10 Positions.
- The focused runtime-coordination suite passed 9 of 9 tests.
- The complete suite passed 89 of 89 tests with no skips or failures.
- The official Skill validator reported `Skill is valid!` for both copies of `$temple-init` and for `$temple-work`. PyYAML was supplied only in an isolated temporary virtual environment, not added to the repository.
- Package dry-run reported `@zsz1210/temple-ai-dev-org@0.1.0-alpha.17`, 176 entries, and included both `src/workers.mjs` and `project-overlay/templew.mjs`.
- `git diff --check` reported no whitespace errors before the feature commit.

## Clean-source recovery exercise

After revision `7f2a2d9` was pushed, a fresh temporary product was initialized from the clean framework checkout. Its lock recorded:

```text
version: 0.1.0-alpha.17
repository_spec: git+https://github.com/zsz1210/temple-ai-dev-org.git#7f2a2d97589d709b6728a77d8d22e62a48277d7b
source_clean: true
```

`node ./templew.mjs doctor <temporary-product> --json` was then run without `TEMPLE_CLI_PATH`. The launcher recovered the exact Git revision through the package runner; doctor reported 31 pass, 0 warn, and 0 fail. The temporary product and validation-only virtual environment were moved to Trash afterward.

## Behaviors exercised

1. Init installs a managed project launcher and matching bootstrap metadata; an explicitly supplied incompatible CLI is rejected.
2. Upgrade from an Alpha.16-shaped lock installs the new managed launcher and schemas while creating only empty, unlisted project-owned resource and worker registries.
3. A lifecycle-stage requirement replaces the legacy Discipline fallback only at that stage, can be intentionally cleared, and cannot be changed for the active stage while the Work Item is claimed.
4. A declared capacity-one verification runtime separates otherwise independent work into distinct waves.
5. `parallel prepare` validates the planned Agent and exact base revision, then records claim, resources, and worker reservation before runtime attachment.
6. Injected persistence failure after claim and reservation creation restores the Work Item, event stream, resource registry, and worker registry byte-for-byte.
7. Every untouched member of one previously verified first wave can be prepared after an earlier sibling changes runtime state. The exact plan digest and per-entry preparation fingerprint prevent edited or target-stale continuation.
8. An internal subagent attaches only a runtime ID. A separate user-owned Codex task attaches through `task register --worker-id`; doctor validates that correlation without counting the internal worker as a task.
9. Worker completion records exact revision and evidence and releases shared resources. It deliberately leaves the lifecycle claim active for explicit handoff and release.
10. A genuinely stale target plan is rejected before canonical execution state changes.

## Evidence boundary

The automated suite uses temporary local repositories and the clean-source recovery exercise uses one host and one filesystem. The short-lived mutation lock is local. The resource registry coordinates declared capacity but does not lock a real Simulator, device, port, CI runner, or external infrastructure. Runtime IDs in the tests are controlled fixtures rather than live subagent or Codex task identifiers.

The retained multi-human, multi-machine validation remains `not_run`. It must exercise separate clones, real branches and pull requests, protected rules, CI, concurrent claims, resource ownership, integration joins, and conflict recovery before a distributed or enterprise-readiness claim.

## Release conclusion

Alpha.17 is suitable for low-risk repository pilots that need a recoverable CLI and inspectable governance state before runtime creation. It closes the known local Phase 2A gaps without turning Temple into a Codex task creator or distributed scheduler.
