# Technical Design — WI-0092

## Local ownership boundary

Observation mode is operator state for one Git clone, not canonical project policy. A new module, `src/local-observer-service.mjs`, stores only a bounded service manifest below the resolved Git-common Control Plane state directory and a macOS LaunchAgent definition under the current user's `Library/LaunchAgents` directory.

Neither file is added to `temple.lock`, `.ai-org/project`, project backup, or Git. `temple init` and `temple upgrade` do not install or activate it.

## CLI lifecycle

Add four explicit actions:

```text
temple control-plane observer-status [target]
temple control-plane observer-plan [target] [--port N] [--lan-viewer-host RFC1918] [--lan-viewer-port N] [--codex-command absolute-path]
temple control-plane observer-apply [target] --expected-plan sha256 [same plan options] [--activate] [--confirm-replace]
temple control-plane observer-remove [target] --expected-plan sha256 --confirm-delete
```

Rules:

1. `observer-status` and `observer-plan` are read-only and never invoke a model.
2. The plan resolves the exact project root, state directory, Node executable, repository launcher, Codex executable, listener addresses, LaunchAgent label/path, log paths, and argument vector.
3. The digest covers all behavior-affecting fields and excludes display timestamps.
4. `observer-apply` recomputes the plan and requires the exact digest. Replacement of a different installed plan requires `--confirm-replace`.
5. `--activate` is the explicit authority to call `launchctl`; without it the definition is installed but not started.
6. Activation failure restores the previous local definition and manifest when possible. No canonical repository file changes.
7. `observer-remove` requires the installed digest and `--confirm-delete`, stops the exact label, and removes only the manifest and exact generated plist.
8. macOS is the only managed platform in this slice. Other platforms return a bounded `unsupported-platform` result.

The LaunchAgent calls Node directly with an argument array. It does not use a shell, stores no credential, and starts:

```text
node <absolute-templew> control-plane start <absolute-project> \
  --codex --observation-mode managed-local \
  --codex-command <absolute-codex> \
  --host 127.0.0.1 --port <loopback-port> \
  [--lan-viewer-host <private-ip> --lan-viewer-port <port>]
```

## Runtime projection

`startControlPlaneServer` receives `observationMode` and passes this clone-local context into the Usage builder:

```json
{
  "mode": "off | on-demand | managed-local",
  "started_at": "ISO-8601 or null",
  "continuous_expected": false,
  "platform": "darwin | linux | win32 | other",
  "service_status": "not-installed | installed | running | degraded | unsupported"
}
```

The mode is `on-demand` when `control-plane start --codex` is run without managed-local selection. A running managed service uses the manifest `applied_at` as its declared observation boundary. The Control Plane can still run with mode `off` and no Codex Provider.

## Gap projection

Extend `usage.source.capture_health` with:

```json
{
  "observation_mode": "managed-local",
  "observation_started_at": "2026-09-02T00:00:00.000Z",
  "continuous_observation_expected": true,
  "service_status": "running",
  "capture_gap": {
    "status": "not-applicable | clear | unobserved-completed-work",
    "completed_since_observation_started": 3,
    "captured_completed_since_observation_started": 2,
    "uncaptured_completed_since_observation_started": 1,
    "uncaptured_work_item_ids": ["WI-0003"],
    "work_item_backfill_supported": false,
    "account_usage_allocation": "unallocated"
  }
}
```

Only canonical `done` Work Items whose `updated_at` is at or after the observation boundary enter the post-start calculation. A Work Item counts as captured only when a detailed correlated observation names it. The gap does not prove that the service was down; it proves only that accepted work lacks Work Item-level usage evidence.

Historical completed-work coverage remains separate so old pre-observation work does not become a new operational alert.

## Dashboard

The existing capture-health card adds:

- the selected clone-local mode;
- service state when managed-local is selected;
- a bounded warning when completed work after the declared boundary lacks detailed correlation;
- a copyable next step that distinguishes starting on demand, inspecting the managed service, and registering an external Codex task.

The LAN view remains read-only. It receives only the same aggregate mode and Work Item IDs already visible elsewhere; it receives no service file paths, executable paths, launch label, logs, session secret, Inbox, or Agent Commands.

## Registration boundary

- Temple Provider-owned launch already registers the returned thread before `turn/start`; preserve that path.
- Host-owned Codex tasks remain explicit through `temple task register` with one Work Item, Position, Agent, and stable thread ID.
- This Work Item does not scan all Codex history, infer project ownership from `cwd`, or create Work Items automatically.

## Portability

Retained telemetry survives Provider and Control Plane shutdown inside the same Git clone. It is not transported by Git. Export/import and cross-machine aggregation remain future capabilities; the Dashboard states that limit rather than promising portability.

