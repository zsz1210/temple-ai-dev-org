# WI-0014 active-task usage baseline

- Status: Developer and Independent QA passed; live observation degraded
- Date: 2026-08-30
- Environment: Darwin 25.5.0 arm64, Node.js 25.6.1, npm 11.11.0
- Work Item: `WI-0014`

## Scope

This slice extends the existing read-only usage report with longitudinal coverage derived from canonical Work Items, registered Codex tasks, and provider-owned detailed usage observations. It does not create a second lifecycle authority, infer missing Token values, look up prices, recommend or switch models, or write to an external system.

## Implemented behavior

- Completed canonical Work Items and completed Work Items with registered tasks are counted separately.
- Live-resumable, history-reconcilable, historical-only, terminal, and detached archived task eligibility remains explicit.
- A detailed observation is correlated only when its Work Item ID and task ID exactly match one registered canonical pair.
- Each Token field reports `observed`, `partial`, or `unknown` support independently; an unsupported field stays `null` in totals.
- Coverage lists are sorted, and the coverage projection is stable when Work Item and task input order changes.
- The report exposes the remaining gap to ten correlated Work Items and ten correlated completed Work Items, while varied task shapes and longitudinal comparison remain `not-evaluated`.
- Savings, cost, model-quality, and routing claims remain disabled.

## Developer verification

- `node --test test/phase-4b.test.mjs` passed 8 tests with zero failures, skips, or todos.
- `npm run verify` passed repository checks, documentation-link checks, and all 165 tests with zero failures, skips, or todos.
- The focused cases cover no registered tasks, historical-only tasks, one live task without usage, one exactly correlated observation, partially supported Token fields, unknown totals, deterministic coverage order, and read-only `--no-write` behavior.

## Self-host active-task observation

The Engineering Manager supplied two read-only main-worktree `usage preflight` observations for the newly registered user-owned `task-0002` while the Developer task was active:

1. Before implementation, the Codex Provider reported `ready`, `live_resumable=1`, `detailed_thread_usage=awaiting-observation`, and `observations=0`.
2. During implementation, `task-0002` remained live-resumable, but the Provider became `degraded` with exact reason `Codex App Server thread/resume failed (-32600)`. Detailed usage remained `awaiting-observation`, observations remained zero, and Token totals remained unknown.

This is a truthful failed observation attempt, not a passing correlated observation. No Token value, zero-usage conclusion, workaround, or optimization result is inferred from it.

## Remaining limits

- Temple still has no provider-owned detailed usage event correlated to this active task.
- The current host/provider bridge cannot resume this already-running Codex task through the observed App Server path; a supported host-event bridge or provider behavior remains future work.
- The ten-varied-Work-Item gate, longitudinal comparison, Token-savings evidence, monetary cost, model-selection quality, and routing evidence remain open.
- Fresh Independent QA passed the exact integrated candidate in a separate detached worktree; the provider bridge and ten-correlated-Work-Item qualification gaps remain open.
