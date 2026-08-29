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

The server exposes:

- `GET /` — the local read-only Phase 3A surface;
- `GET /healthz` — process and journal health;
- `GET /api/v1/snapshot` — canonical Observer plus provider and journal state;
- `GET /api/v1/events` — SSE replay and live local events.

An SSE client may send `Last-Event-ID` or `?after=<cursor>`. A retained cursor receives only newer records. If retention has removed the requested cursor, the server sends a fresh `temple.snapshot` event before continuing with retained events.

Phase 3A rejects non-GET requests. Human Inbox commands are not available until the authority gateway and its tests are present.

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

Alpha.20 ships the event spine, local journal, repository and fixture provider contracts, read-only snapshot API, and SSE reconnect path. It does not yet claim a live Codex App Server adapter, alert engine, Human Inbox mutation gateway, or GitHub PR and Checks evidence adapter. See the accepted [Phase 3 design](phase-3-control-plane.md) and [work breakdown](phase-3-work-items.md).
