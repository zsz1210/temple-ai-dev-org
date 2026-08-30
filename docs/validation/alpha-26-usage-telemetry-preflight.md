# Alpha.26 usage telemetry preflight

- Status: passed with retained Phase 4B limits
- Candidate revision: `25a979e5bde887b00b30a94d5c26fe9403c7a558`
- Environment: Darwin 25.5.0 arm64, Node.js 25.6.1, npm 11.11.0, Codex CLI 0.150.0-alpha.12.2
- Work Item: `WI-0011`

## Scope

Alpha.26 qualifies the usage evidence Temple can observe before it makes any optimization claim. It separates detailed active-thread telemetry from optional account-wide activity, fixes terminal-task subscription behavior, and preserves unknown, privacy, and authority boundaries.

The protocol design follows the official [Codex App Server documentation](https://developers.openai.com/codex/app-server/). The local Codex CLI's generated v2 schema independently confirmed the `threadId`, `turnId`, `tokenUsage.total`, `tokenUsage.last`, and `modelContextWindow` parser shape.

## Developer verification

- The exact candidate checkout passed repository and documentation-link checks.
- `npm run verify` passed all 160 tests with zero failures, skips, or todos.
- `doctor` reported 35 passes, one stale generated parallel-plan warning, and zero failures.
- The real read-only preflight reported one terminal registered task, zero live-resumable tasks, zero detailed observations, and an unqualified baseline.
- The explicitly requested account probe confirmed summary-field and daily-bucket availability while outputting no account Token value. It remained `account-wide`, `unallocated`, and unable to qualify the project baseline.

## Independent QA

Independent QA created a fresh detached worktree at the candidate revision, installed dependencies with `npm ci`, and reran the full suite. All 160 tests passed; Doctor again had zero failures, and the no-probe preflight independently reproduced the terminal-only, no-observation, unqualified state. The worktree remained clean and was removed after verification.

## Proven behavior

- Active, waiting, and attention tasks on nonterminal Work Items preserve the live-resume path.
- Completed tasks and tasks attached to `done` or `cancelled` Work Items receive bounded history reconciliation without `thread/resume`.
- Archived tasks stay detached from Provider reconciliation.
- The Provider sends the documented `initialized` notification.
- Preflight states distinguish observed data, a ready live task awaiting data, missing live task topology, and Provider unavailability.
- Account-probe success and failure retain bounded metadata only; provider error details and raw usage values are discarded.
- Only detailed thread observations with Work Item and task correlation can qualify the first project observation.
- No model is called to count Tokens, and no recommendation, model switch, price lookup, spending action, lifecycle mutation, or external write occurs.

## Remaining limits

This validation does not prove a live detailed usage event for Temple, per-Work-Item or per-Position consumption, monetary cost, Token savings, model-selection quality, automatic routing, or Phase 4B completion. The retained exit evidence still requires at least ten varied real Work Items and longitudinal comparison. A future supported host-event bridge may be needed to observe already-running Codex Desktop tasks without Temple owning their connection.
