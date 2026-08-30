# Phase 3 work items

- Status: Accepted
- Implementation status: Phase 3A, 3B, and 3C complete with the retained limits in their validation records
- Parent design: [Phase 3 real-time control plane](phase-3-control-plane.md)

The increments below are deliberately ordered. Each one must retain a working repository provider and deterministic fixtures so Temple remains useful when Codex or GitHub integration is absent.

## Phase 3A — Event spine and provider foundation

- Delivery: `0.1.0-alpha.20`
- Status: Complete with the retained limits in its validation record

### Goal

Create the replay-safe local state boundary before building a live dashboard or accepting human actions.

### Deliverables

- Versioned normalized event envelope and backward-compatible canonical event reader.
- Local telemetry state directory resolved from the Git common directory, with an explicit override.
- Single-writer daemon lease, append-only journal, monotonic cursor, checkpoints, retention, and rebuild command.
- Provider capability contract and health model.
- Always-available repository provider.
- Fixture provider for deterministic event, disconnect, duplicate, and out-of-order tests.
- Read-only local snapshot API and SSE stream.
- Redaction and payload-size policy.

### Acceptance

- Duplicate source events produce one projected result.
- Out-of-order events retain occurrence and observation time without rewriting history.
- Two linked worktrees discover the same local daemon and journal.
- A second daemon cannot become the writer for the same Git common directory.
- Browser reconnect from a retained cursor receives exactly the missed projected records.
- Journal loss can be rebuilt from canonical state with an explicit loss-of-transient-history notice.
- Legacy canonical event lines remain readable and unchanged.
- No prompt, reasoning, command output, secret fixture, or full tool payload appears in durable output.

### Stop condition

Stop after the event spine, repository provider, fixture provider, and read-only SSE path pass. Do not add mutation buttons during 3A.

## Phase 3B — Live Observer, Codex adapter, and alerts

- Delivery target: `0.1.0-alpha.21`
- Status: Complete with the retained limits in its validation record

### Goal

Make current work and failure conditions understandable without granting the dashboard project authority.

### Deliverables

- Overview, Work Item detail, provider-health, and combined timeline views.
- Provenance, freshness, exact revision, and capability-quality labels on every live card.
- Pinned Codex App Server adapter for explicitly managed or safely resumed sessions.
- Normalized thread, turn, item, plan, diff-summary, token-usage, failure, interruption, and runtime-request observations.
- Reconciliation after App Server disconnect or daemon restart.
- Stateful stalled, orphaned, scope-conflict, stale-evidence, and usage-anomaly conditions.
- Alert grace periods, suppression, cooldown, recovery links, and unknown-state handling.

### Acceptance

- Supported Codex fixture and local sessions update the view within the local latency target.
- An unobservable registered Desktop task is labelled registered-only or unknown, never idle or complete.
- Terminal item state wins over transient deltas during reconciliation.
- Provider outage changes dependent conditions to unknown and does not fabricate stalled work.
- Failed and interrupted turns create blocked attention without transitioning the Work Item.
- Plan and diff summaries never expose excluded raw payloads.
- Usage anomaly works with explicit token budgets; monetary cost remains unavailable without a versioned price source.
- The existing static `observe` command remains a valid fallback.

### Stop condition

Stop after read-only live observation and alert recovery pass. Do not answer runtime requests or create canonical approvals during 3B.

## Phase 3C — Human Inbox and GitHub evidence

- Delivery target: `0.1.0-alpha.22`
- Status: Complete with the retained limits in its validation record

### Goal

Allow bounded human decisions while preserving the authority of the original provider request and canonical project commands.

### Deliverables

- Separate runtime-permission, business-fact, and governance-approval Inbox queues.
- Loopback command gateway with session secret, same-origin protection, redaction, expected-state checks, idempotency, and audit.
- Runtime-request bridge only for live, answerable Codex provider requests.
- Proposed-answer capture and explicit canonical incorporation path for business facts.
- Policy-checked, revision-bound governance approval using existing Human Principal and High-Assurance rules.
- Read-only GitHub PR and Checks adapter bound to exact head SHA, with ETag polling and fixture mode.
- Explicit command to capture a reviewed GitHub observation as normalized evidence.

### Acceptance

- Repeating one Inbox submission with the same idempotency key produces one result and one canonical mutation at most.
- A runtime permission cannot become a governance approval.
- A business answer cannot silently change a specification, Work Item, or Decision Ledger.
- A stale or disconnected runtime request cannot be answered from the UI.
- A governance approval fails on wrong revision, wrong principal, insufficient approval count, stale state, or policy violation.
- The browser has no direct repository write path and never receives provider or GitHub credentials.
- GitHub fixture and authorized read-only tests prove SHA binding, ETag handling, rate-limit visibility, and zero external writes.
- Capturing evidence does not automatically satisfy a lifecycle gate.

### Stop condition

Stop after the Inbox and read-only GitHub evidence flow pass. Do not add remote access, notifications, tracker writes, PR mutation, merge, deployment, or production operations.

## Cross-increment validation matrix

| Scenario | 3A | 3B | 3C |
|---|---:|---:|---:|
| Duplicate and out-of-order normalized events | Required | Regression | Regression |
| Browser and daemon reconnect | Required | Extended with Codex | Regression |
| Linked-worktree discovery and writer exclusion | Required | Regression | Regression |
| Provider unsupported or offline | Contract only | Required | Regression |
| Failed and interrupted turn | Fixture only | Required | Regression |
| Stale evidence and exact revision | Projection only | Required | Required for mutation |
| Secret and sensitive-payload redaction | Required | Required | Required |
| Runtime request expires during disconnect | Fixture only | Read-only condition | Required action refusal |
| Duplicate human submission | Not applicable | Not applicable | Required |
| GitHub wrong SHA, rate limit, and ETag | Not applicable | Not applicable | Required |

## Retained later work

- Real multi-machine or cross-clone control-plane convergence.
- Remote browser access, authentication, RBAC, and centralized audit storage.
- Background notifications and escalation routing.
- GitHub, CI, tracker, or deployment write operations.
- Monetary cost calculation without a versioned and user-approved price source.
- Large-scale soak, retention, backup, and restore testing beyond the Phase 3 local failure matrix.
