# Alpha.21 live control-plane validation

- Version: `0.1.0-alpha.21`
- Feature revision: `a3562c4e989478c1f325db7b4b8bb956cc9a5eb8`
- Validation date: 2026-08-30
- Environment: macOS 26.5.2 arm64, Node.js `v25.6.1`, Codex CLI `0.150.0-alpha.12.2`
- Result: Passed with retained limits

## Automated evidence

- `npm run verify` passed repository integrity and all 122 tests at the feature revision.
- Ten focused control-plane tests passed redaction, deduplication, retained-cursor replay, linked-worktree state, writer exclusion, terminal-over-transient reconciliation, honest registered-only and unknown status, provider-outage suppression, scope-conflict recovery and cooldown, token-budget anomaly, safe App Server summaries, runtime-request memory boundaries, and read-only HTTP/SSE behavior.
- A deterministic fake App Server completed initialize, thread read, explicit resume, snapshot reconciliation, live plan and diff-summary ingestion, and pending runtime-request observation. Durable journal inspection found the allowed plan and file-path summaries and did not find excluded explanation, diff body, or command content.

## Local integration and browser evidence

- A real Codex App Server accepted `initialize` and read-only `thread/list`; the live provider reported ready through the pinned `codex-app-server-v2-observer-2026-08-30` profile.
- A fresh initialized Git repository with two Work Items started the control plane through `control-plane start --codex`. The repository and Codex providers both reported ready and the SSE connection reported live.
- A headed Playwright session opened the loopback dashboard, expanded a Work Item, and observed operational metrics, provider capability labels, the unknown token-budget condition, canonical and observed timeline provenance, and the no-gate-authority footer. The final browser pass had no console error or warning.
- The browser rendered a registered-task-free project honestly: both Work Items were queued, runtime freshness was unknown, and no idle, complete, or stalled runtime state was fabricated.

## Authority and privacy checks

- The server continued to reject non-GET requests in Alpha.21.
- Failed and interrupted provider observations produce blocked live attention only; they do not transition a Work Item.
- Raw prompts, reasoning, command strings, command output, diff bodies, and complete tool payloads are excluded from the durable event model. Numeric token counters remain observable without weakening secret-string redaction.
- Conditions and provider state are generated below the Git common directory and cannot satisfy lifecycle gates.

## Retained limits

- Live Codex visibility covers only sessions Temple explicitly reads and resumes from registered thread IDs. Existing Desktop tasks are not universally observable.
- The first adapter pins a tested protocol profile rather than promising compatibility with every future App Server build.
- Alert thresholds require project tuning; token anomaly remains unknown until an explicit token budget exists, and monetary cost is unavailable without a versioned price source.
- Human Inbox actions, runtime-request answers, governance approval mutation, and GitHub PR and Checks evidence remain Phase 3C work.
- Long-duration soak, crash-at-every-write-point, large-journal performance, cross-clone convergence, remote access, and multi-machine validation remain outside this increment.
