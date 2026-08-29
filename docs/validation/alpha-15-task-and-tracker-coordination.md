# Alpha.15 task and tracker coordination validation

- Version: `0.1.0-alpha.15`
- Feature revision: `fe83b56454c81e375d923137e851dd1d6c4603a3`
- Date: 2026-08-30
- Environment: macOS 26.5.2 (25F84), arm64, Node.js 25.6.1, npm 11.11.0
- Result: Passed with explicit external-integration limits

## Scope

This record validates the local framework contract for separating company tracker items, repository Work Items, and Codex execution tasks. It covers configuration, visibility, mapping, bounded observations, field ownership, reconciliation planning and evidence, generated views, context inheritance, upgrade preservation, and repository packaging. It does not claim a production Jira or GitHub integration test.

## Commands and results

```text
node --check src/tracker.mjs
node --check src/doctor.mjs
node --check src/context.mjs
node --check src/status.mjs
node --test test/tracker.test.mjs
npm run verify
npm pack --dry-run --json
```

Observed results:

- Repository checks passed with 62 overlay files and all 10 Positions.
- The focused tracker suite passed 6 of 6 tests.
- The complete suite passed 73 of 73 tests with no skips or failures.
- Package dry-run included `src/tracker.mjs`, the tracker schema and seed, updated Position instructions, ADR-0020, and the task-and-tracker guide.
- `git diff --check` and the staged diff check reported no whitespace errors before the feature commit.

## Behaviors exercised

1. A clean initialization creates a project-owned repository-only tracker seed and Alpha.15 managed capabilities.
2. Upgrade creates a missing tracker seed, rolls it back after a later migration race, and preserves an existing project-owned tracker configuration byte-for-byte.
3. Protected lifecycle and evidence fields cannot be delegated to an external provider, provider records cannot contain credentials, and external URLs must use the configured HTTPS origin.
4. Root Work Items default to `team-visible`; child Work Items default to `internal`; internal items reject direct tracker mappings.
5. A primary external item cannot be owned by two Work Items, while shared supporting mappings remain distinct in the generated view.
6. The GitHub Issues adapter invokes `gh api` through an argument array, rejects pull requests, omits issue bodies, and emits a bounded normalized observation.
7. Manual observations validate provider identity, revision, timestamps, normalized status, planning-field types, due-date format, labels, and provenance.
8. External `done` cannot advance the Work Item lifecycle or be accepted as Temple-owned truth.
9. Negotiated title drift can be accepted explicitly when no protected-field conflict exists; keep, defer, and acknowledge resolutions remain explicit.
10. Reconciliation records an immutable project artifact, Work Item evidence pointer, append-only event, and generated plan with `external_write_performed: false`.
11. `doctor` detects missing or inconsistent reconciliation evidence; `status` reports mappings and outstanding actions; an internal child Context Capsule inherits the parent mapping without gaining a direct mapping.
12. CLI planning with `--no-write` performs no repository write, and every tracker command in this release performs no external mutation.

## Evidence boundary

The GitHub adapter was tested with deterministic adapter output rather than a real authenticated repository. Jira and generic providers were tested through the normalized manual-observation boundary, not through network access. No test created, edited, assigned, transitioned, commented on, or closed an external item.

The retained large multi-human, multi-machine test remains `not_run`. Real company adoption must still validate provider permissions, sensitive metadata retention, concurrent pull-request behavior, mapping conventions, and human reconciliation under the organization's own tracker workflow.

## Release conclusion

Alpha.15 is suitable for low-risk repository validation of tracker mappings and read/reconcile behavior. It is not evidence for enabling external write-back, automatic bidirectional synchronization, or replacing the company tracker or Temple lifecycle as their respective authorities.
