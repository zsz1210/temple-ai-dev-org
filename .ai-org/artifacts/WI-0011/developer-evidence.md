# Developer evidence — WI-0011

- Position: Developer
- Agent Identity: Rikku
- Candidate revision: `25a979e5bde887b00b30a94d5c26fe9403c7a558`
- Result: pass to Quality & Evaluation

## Exact-revision verification

- The primary checkout was clean and resolved to the exact candidate revision before verification.
- `npm run verify` passed repository checks, documentation-link checks, and all 160 tests with zero failures, skips, or todos.
- The 15 focused Control Plane and Phase 4B tests passed task-topology, terminal-history, live-resume, initialization, account-probe, detailed-usage, privacy, and fail-closed attribution cases.
- `doctor` reported 35 passes, one stale generated parallel-plan warning, and zero failures. The warning is rebuildable coordination state and does not affect the candidate behavior.

## Real preflight observation

- Temple reported one registered terminal task, one history-reconcilable task, zero live-resumable tasks, and zero detailed usage observations.
- Detailed usage status was `no-live-registered-task`; baseline qualification remained `not-qualified`.
- Without the explicit flag, account activity was `not-probed`.
- With `--probe-codex-account`, the current Codex-backed account exposed the documented summary-field and daily-bucket capability. Temple retained only field names, bucket availability/count, and local latency; it emitted no account Token value.
- The account result remained `account-wide` and `unallocated`, and could not qualify or populate the project baseline.
- Measurement declared no model-generation or Token-counting model call, and routing, model switching, spending, lifecycle mutation, and external action remained disabled.

## Protocol basis

- The official Codex App Server contract identifies `thread/tokenUsage/updated` for detailed active-thread usage and `account/usage/read` for account activity.
- The locally bundled Codex CLI was `0.150.0-alpha.12.2`; its generated v2 token-usage schema matched Temple's parser fields.
- Provider integration coverage proved that a terminal Work Item receives bounded `thread/read` reconciliation without `thread/resume`, while the existing live-task fixture retains the resume path.

## Limits and rollback

This evidence establishes telemetry qualification, not Token savings, cost savings, recommendation quality, or a longitudinal baseline. Revert candidate revision `25a979e5bde887b00b30a94d5c26fe9403c7a558` to roll back the implementation. Runtime state below `.git/temple/` is generated and disposable; canonical Work Items and Evidence Registry entries retain their existing authority.
