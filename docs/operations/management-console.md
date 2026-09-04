# Optional Management Console

Temple does not require a browser interface. Work Items, lifecycle gates, evidence, collaboration, context routing, and verification remain available through Temple Core when this process is never started.

Use the Management Console when a person wants a read-only browser view of current repository state and retained local telemetry. Starting it does not connect Codex, collect new Token data, acquire the telemetry writer lease, install a service, or enable the Human Inbox and Agent Commands.

## Start only when needed

From an initialized project:

```bash
node ./templew.mjs console start .
```

The command prints a loopback URL and runs until `Ctrl-C`. The page identifies itself as `Local · Read only`.

For one exact trusted home-LAN address:

```bash
TEMPLE_LAN_IP="$(ipconfig getifaddr en1)"
node ./templew.mjs console start . \
  --lan-viewer-host "$TEMPLE_LAN_IP" \
  --lan-viewer-port 41741
```

The LAN listener remains GET-only and uses the existing private-viewer redaction boundary. It does not turn the loopback listener into a network command gateway. Tailscale viewing is also an explicit Console option:

```bash
node ./templew.mjs console start . --tailscale-viewer
```

Neither private-viewer option starts Usage collection.

## What updates the page

The Console reads canonical `.ai-org/` state and retained telemetry only when a browser requests a snapshot. It watches bounded project-state and telemetry directories for file changes, invalidates its cached snapshot, and sends a refresh signal to connected pages. It does not run the Control Plane's 750 ms repository polling loop.

An unchanged cached snapshot is reused for at most 30 seconds. A changed file causes the next browser request to rebuild it. This removes idle background scanning; it does not claim that rebuilding a large retained Usage history is free. WI-0094 retains that separate performance question.

## Run it with or without collection

The Console opens telemetry read-only and never acquires the writer lease. A separate Collector can therefore run at the same time:

```bash
# Terminal 1: optional human view
node ./templew.mjs console start .

# Terminal 2: optional on-demand Token collection
node ./templew.mjs usage collect .
```

Stopping either process does not stop Temple Core or delete retained telemetry. If the Collector is off, new task-level Usage remains unknown; the Console continues to show canonical project state and prior observations.

## Read-only route boundary

The optional Console exposes only:

- `GET /` — the human-facing Management Console;
- `GET /healthz` — optional-process health and authority facts;
- `GET /api/v1/snapshot` — a path-redacted read-only snapshot;
- `GET /api/v1/events` — refresh notifications without raw journal events.

Every non-GET request returns `405`. The Console snapshot excludes the local daemon record, Human Inbox, raw recent events, and telemetry state-directory path.

## Legacy combined operator path

`temple control-plane start` remains available during the current Alpha for existing workflows that intentionally combine the browser, repository provider, telemetry writer, and optional command gateway. It is not the recommended way to obtain a read-only project overview. See [Legacy combined control plane](control-plane.md) for that larger authority surface and [Usage observation](usage-observation.md) for collection choices.
