# Local control plane

The Phase 3 control plane combines canonical repository state with generated local telemetry without giving telemetry authority over lifecycle gates.

## State boundary

- `.ai-org/` remains canonical project state.
- `<git-common-dir>/temple/control-plane/` is generated local state shared by linked worktrees in one clone.
- Browser snapshots and SSE frames are disposable views.

The local journal records normalized metadata and bounded summaries. It excludes raw prompts, hidden reasoning, full command output, secrets, and complete tool payloads by default. Recording a telemetry event never satisfies a gate.

## Configuration

`.ai-org/project/control-plane.json` is project-owned. The safe default:

- binds only to `127.0.0.1`;
- lets the operating system select a free port;
- retains up to 10,000 local events;
- evaluates stalled work after five minutes, with a 30-second pending period and 60-second cooldown;
- leaves token anomaly detection unknown until an explicit token budget is configured;
- disables raw-payload capture;
- enables the repository provider.

An explicit `state_directory` or `--state-dir` may move generated telemetry outside the Git common directory. The CLI rejects a version-controlled worktree destination and broad targets such as the filesystem root, home directory, project root, or Git common directory itself.

## Commands

Inspect the current local snapshot without changing canonical state:

```bash
node ./templew.mjs control-plane snapshot . --json
```

Start the local server:

```bash
node ./templew.mjs control-plane start .
```

Opt in to the pinned Codex App Server observer for registered task thread IDs:

```bash
node ./templew.mjs control-plane start . --codex
```

The HTTP server and repository snapshot become available before optional Codex history synchronization begins. During that background synchronization, provider-dependent state remains capability-labelled as `registered-only` or `unknown`; the Dashboard does not wait for an entire conversation history before serving health and snapshot routes.

`--codex` performs an App Server handshake, reads each non-archived registered thread, and explicitly resumes it to receive live notifications. The initial reconciliation retains the newest 20 turns and at most 200 items per registered thread by default. A successful `thread/read` snapshot is not duplicated by the following resume response. A task that cannot be attached or uses an unavailable provider remains `registered-only` or `unknown`; it is never inferred to be idle or complete. The adapter pins the `codex-app-server-v2-observer-2026-08-30` protocol profile and reports the detected App Server user agent at runtime.

Projects may reduce or increase the bounded startup window without retaining raw content:

```json
{
  "id": "codex-local",
  "kind": "codex-app-server",
  "enabled": true,
  "options": {
    "resume_threads": true,
    "history_turn_limit": 20,
    "history_item_limit": 200
  }
}
```

`history_turn_limit` accepts 1–100 and `history_item_limit` accepts 1–1000. Larger values increase local startup work and journal volume; they do not grant more lifecycle authority.

The server exposes:

- `GET /` — the local live Observer and bounded Human Inbox;
- `GET /healthz` — process and journal health;
- `GET /api/v1/snapshot` — canonical Observer, live projection, stateful conditions, safe Inbox projection, provider health, and journal state;
- `GET /api/v1/events` — SSE replay and live local events.
- `GET /api/v1/inbox` — the same safe, credential-free Inbox projection;
- `POST /api/v1/inbox/runtime-permission` — answer one still-live provider permission request;
- `POST /api/v1/inbox/business-fact` — answer a live question and retain a redacted local proposal;
- `POST /api/v1/inbox/business-incorporation` — explicitly add one proposal as a canonical Work Item context reference;
- `POST /api/v1/inbox/governance-approval` — create one policy-checked approval record for the current exact revision.

An SSE client may send `Last-Event-ID` or `?after=<cursor>`. A retained cursor receives only newer records. If retention has removed the requested cursor, the server sends a fresh `temple.snapshot` event before continuing with retained events.

All other mutation routes return `405`. The browser receives only a new per-process Inbox session secret; provider credentials and GitHub tokens never enter the page or snapshot. Every command POST must come from the exact loopback origin, use JSON no larger than 64 KiB, provide the session secret, and repeat the same idempotency key in its header and body.

## Human Inbox authority

The three queues look similar but cannot substitute for one another:

- **Runtime permission** answers only the original request while the Codex App Server connection and request remain live. Disconnect or request replacement makes the action stale. A provider response is not a repository approval.
- **Business fact** first answers the live question and stores a generated local proposal. Secret answers are represented only by an omission marker. A separate incorporation action checks the actor, current Work Item state, and exact revision, then writes a Markdown source, registers a project-owned Context Map route, and pins that route ID to the Work Item without changing scope, acceptance criteria, specifications, decisions, or lifecycle state.
- **Governance approval** is available only for a Work Item currently at `release_gate`. It creates `temple.approval/v1`, checks the exact candidate revision and active Human Principals, enforces the risk-derived approval count, and applies High-Assurance sponsor independence. It does not close the Work Item or perform a release.

Accepted and rejected commands are audited below the generated control-plane state directory. Repeating a completed command with the same idempotency key returns its prior result; reusing that key for different input is rejected. Canonical mutations also run through the project mutation lock and their own duplicate guards.

## GitHub PR and Checks provider

Add an explicit provider to `.ai-org/project/control-plane.json`:

```json
{
  "id": "github-pr-42",
  "kind": "github",
  "enabled": true,
  "options": {
    "repository": "owner/repository",
    "pull_number": 42,
    "head_sha": "0123456789abcdef0123456789abcdef01234567",
    "work_item_id": "WI-0001",
    "token_env": "GH_TOKEN",
    "poll_interval_ms": 30000
  }
}
```

The configured SHA must be a full lowercase commit. `token_env` names an environment variable; never place the credential itself in project configuration. The provider performs only GitHub REST `GET` requests for the configured pull request and Check Runs at that exact SHA, uses ETags, reports rate-limit state, and becomes degraded instead of reading checks when the observed PR head differs. An optional `fixture_path` must remain inside the project repository and replaces network polling for deterministic tests.

After reviewing the observation, capture it explicitly:

```bash
node ./templew.mjs control-plane capture-github . \
  --provider-id github-pr-42 \
  --work-item WI-0001 \
  --revision 0123456789abcdef0123456789abcdef01234567
```

Capture rechecks the configured, observed, and locally resolvable Git commit, then appends normalized `github` evidence. It performs no GitHub write and does not populate Work Item gate evidence or transition lifecycle state.

## Live observation and alert semantics

The live view correlates only registered task thread IDs with Work Items. It retains plan steps, changed-file counts, diff statistics, token counts, lifecycle state, and request metadata. It does not retain raw prompts, hidden reasoning, commands, command output, diff bodies, or full tool arguments and results. Initial reconciliation uses a bounded `thread/read` snapshot. Only registered tasks in `active`, `waiting`, or `attention` status whose Work Item is nonterminal are resumed for live notifications. Completed tasks and tasks attached to `done` or `cancelled` Work Items remain history-only; archived tasks remain detached from Provider reconciliation. Terminal item state wins over a later transient delta. Canonical Work Items in `done` or `cancelled` appear in the `terminal` category rather than returning to the queued-work count.

`usage preflight` inspects this topology and any retained detailed usage without writing canonical or generated project state. The separately authorized Codex account probe is account-wide, unallocated, value-discarding, and incapable of satisfying a lifecycle or baseline gate. See [Token Efficiency and Model Routing](token-efficiency-and-model-routing.md).

Conditions use `true`, `false`, or `unknown` status and a separate `pending`, `firing`, `suppressed`, or `resolved` lifecycle. The initial set covers stalled work, orphaned work, scope conflict, stale evidence, and token-usage anomaly. Provider outages suppress dependent conclusions as `unknown`. Failing or interrupted turns create observed blocked attention without changing the canonical Work Item lifecycle.

## Provider fixtures

Deterministic provider fixtures test replay, redaction, disconnect, ordering, and future provider adapters without requiring a live external service:

```json
{
  "schema_version": "temple.provider-fixture/v1",
  "provider_id": "fixture-local",
  "observed_at": "2026-08-30T00:00:00.000Z",
  "events": [
    {
      "id": "turn-1-completed",
      "source": "urn:temple:provider:fixture:local",
      "type": "org.temple.fixture.turn.completed.v1",
      "time": "2026-08-30T00:00:00.000Z",
      "data": { "work_item_id": "WI-0001", "status": "completed" }
    }
  ]
}
```

```bash
node ./templew.mjs control-plane ingest . --fixture ./provider-fixture.json --json
```

The `source` and `id` pair is the deduplication identity. Reusing the pair with different non-redacted content is an identity collision rather than a second event.

## Recovery

Only one local daemon may write the journal for one Git common directory. A stale dead-process lease may be recovered; an active writer is never displaced.

Rebuild generated telemetry from canonical repository events while preserving the previous journal in a timestamped local archive:

```bash
node ./templew.mjs control-plane rebuild . --json
```

A rebuild restores canonical history projection. Provider-only transient history remains only in the archived journal and is not presented as canonical truth.

## Current capability boundary

The local Phase 3 increments include replay-safe telemetry, the live Observer, capability-proven Codex App Server observation, stateful conditions, the authority-separated Human Inbox, and an exact-SHA read-only GitHub PR and Checks provider with explicit evidence capture. The current reliability pass also separates terminal work from queued work and prevents optional Codex history synchronization from blocking the local HTTP surface. It does not provide remote access, notifications, tracker or PR writes, merge, deployment, production operations, universal visibility into existing Codex Desktop tasks, cross-clone consensus, or production-grade retention. See the accepted [Phase 3 design](../planning/phase-3-control-plane.md), [work breakdown](../planning/phase-3-work-items.md), and validation records.
