# Usage observation

Temple can organize and deliver work without observing Token usage. Usage observation is an optional, clone-local operating mode for people who want per-Work-Item analysis in the Management Console.

## Choose a mode

| Mode | What runs | When to use it | New detailed Token data |
| --- | --- | --- | --- |
| Off | No Codex Provider | The framework is being evaluated, the machine should run no background service, or task-level analytics are unnecessary | Not collected; missing values remain unknown |
| On demand | A foreground Control Plane with the Codex Provider | Short analysis sessions, development, and troubleshooting | Collected only while the process is running and an eligible registered task emits usage |
| Managed local | An explicitly installed macOS LaunchAgent for this clone | A regular workstation where continuous local capture is worth the operational cost | Expected while the service is healthy and tasks are registered |

The selected mode is local operator state. It is not committed to Git, installed by `temple init`, or imposed on other contributors.

## What is retained

Detailed provider observations are stored below the clone's Git common directory by default. Stopping the Control Plane or Codex Provider does not delete earlier observations. Removing a managed service also leaves telemetry intact.

Temple retains numeric usage and proven attribution fields. It does not retain raw prompts, responses, hidden reasoning, credentials, or raw provider payloads for this feature.

The boundary is important:

- a registered Work Item and Codex task do not contain their Token amount;
- Git does not transport clone-local telemetry;
- work performed while detailed observation was unavailable cannot later be reconstructed at Work Item level;
- `account/usage/read` is account-wide and remains unallocated, so Temple does not distribute those values across projects or tasks.

The official Codex App Server provides active-thread `thread/tokenUsage/updated` notifications and a separate account usage query. It does not document a guaranteed historical replay of per-turn usage through `thread/read`. See the [Codex App Server protocol](https://developers.openai.com/codex/app-server/).

## Run on demand

From an initialized project repository:

```bash
node ./templew.mjs control-plane start . \
  --codex \
  --observation-mode on-demand
```

Add the private home-LAN viewer only with one exact RFC1918 address:

```bash
node ./templew.mjs control-plane start . \
  --codex \
  --observation-mode on-demand \
  --lan-viewer-host 192.168.1.25 \
  --lan-viewer-port 41741
```

The full Console stays on loopback. The LAN listener is GET-only and omits the Human Inbox, Agent Commands, session secrets, raw events, service paths, and local executable details.

## Install managed local observation on macOS

Managed local observation is macOS-only in the current implementation. Preview the exact plan first:

```bash
node ./templew.mjs control-plane observer-plan . \
  --port 8766 \
  --lan-viewer-host 192.168.1.25 \
  --lan-viewer-port 41741 \
  --json
```

Review the absolute project, Node, Codex, listener, plist, log, and state paths. Copy the returned `plan_digest`, then install and start that exact plan:

```bash
node ./templew.mjs control-plane observer-apply . \
  --port 8766 \
  --lan-viewer-host 192.168.1.25 \
  --lan-viewer-port 41741 \
  --expected-plan sha256:REVIEWED_DIGEST \
  --activate
```

`observer-apply` without `--activate` installs the definition but does not call `launchctl`. Replacing a different installed plan additionally requires `--confirm-replace`. The LaunchAgent executes Node and the repository launcher directly with an argument array; it does not invoke a shell or store credentials.

Inspect current clone-local state:

```bash
node ./templew.mjs control-plane observer-status .
```

Remove only the exact installed plan:

```bash
node ./templew.mjs control-plane observer-remove . \
  --expected-plan sha256:INSTALLED_DIGEST \
  --confirm-delete
```

Removal stops the exact LaunchAgent when it was activated and deletes only the generated plist plus clone-local service manifest. Retained usage telemetry is not deleted.

## Register a Codex task

Temple Provider-owned launches register their returned thread before starting the turn. A Codex task created elsewhere remains explicit:

```bash
node ./templew.mjs task register . \
  --work-item WI-0001 \
  --position developer \
  --thread-id THREAD_ID \
  --execution-origin codex-host-owned \
  --launch-revision GIT_COMMIT
```

Registration creates correlation, not usage. The task must still be observable by the active Provider and emit a detailed Token notification.

## Read capture gaps

The Usage view separates two questions:

1. **All-time coverage:** how many completed Work Items have any correlated detailed observation?
2. **Since observation started:** which Work Items completed after the current local observation boundary but have no correlated detailed evidence?

A post-start gap may mean the task was not registered, the Provider was unavailable, or the active connection did not receive the notification. It does not by itself prove that the managed service was down. Temple lists the affected Work Item IDs and keeps backfill marked unsupported.

## Multi-machine limit

Each developer's observer sees only tasks available to that local Codex Provider and keeps telemetry in that clone's Git common directory. One managed service is not an organization-wide collector. Cross-machine export, merging, and centralized aggregation remain future work.
