# Alpha.20 control-plane event-spine validation

- Version: `0.1.0-alpha.20`
- Feature revision: `c7e61d109ca2d7c3c1120691a58853879a494644`
- Date: 2026-08-30
- Environment: macOS arm64, Node.js `25.6.1`, npm `11.11.0`
- Scope: Phase 3A
- Result: `passed_with_limits`

## Verified locally

- `npm run verify` passed repository checks and 118 automated tests.
- Six focused control-plane tests passed event redaction, stable-identity deduplication, identity-collision refusal, monotonic cursors, retention reset, single-writer exclusion, linked-worktree common-state resolution, project-owned upgrade seeding, fixture replay, HTTP snapshot, SSE reconnect replay, POST refusal, and recoverable rebuild archiving.
- A fresh initialized project receives a schema-validated project-owned `.ai-org/project/control-plane.json` safe seed. Upgrade creates the seed when absent and does not add it to managed ownership or overwrite later project changes.
- The default generated state resolves below the Git common directory, so linked worktrees in one clone share a journal without adding telemetry to Git history.
- The journal records CloudEvents-compatible identity fields, occurrence and observation time, a durable local cursor, redacted bounded data, and no gate authority.
- The repository provider normalizes the existing append-only canonical audit stream. The fixture provider gives deterministic replay input without requiring a live service.
- The local server binds to loopback, exposes health, canonical snapshot, and SSE endpoints, and rejects mutation requests in this increment.
- Rebuild moves the old journal into a timestamped local archive before reconstructing canonical repository events.

## Retained limits

- A live Codex App Server adapter, provider reconnect reconciliation, plan and diff summaries, token usage, alerts, and the full live dashboard belong to Phase 3B.
- Runtime permission answers, business-fact incorporation, governance approval mutation, CSRF and idempotency enforcement, and GitHub PR and Checks evidence belong to Phase 3C.
- Cross-clone, remote, and multi-machine journal convergence is not implemented or claimed.
- SSE latency was exercised within the focused two-second local test bound, but no long-running soak or cross-platform performance claim was made.
- No external service, GitHub repository, Codex task, deployment, notification, or production action was mutated.

Alpha.20 satisfies the Phase 3A local exit gate. It is a recoverable foundation for the next increments, not a claim that the complete Phase 3 control plane is delivered.
