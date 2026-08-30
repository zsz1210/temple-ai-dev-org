# Technical design — Dashboard usage and model observability

## Snapshot integration

`buildControlPlaneSnapshot` will create the existing `temple.usage-baseline/v1` projection in memory by calling `buildUsageBaselineFromRecords`. Its inputs are:

- `observer.project` and `observer.work.items` from the same canonical observer pass;
- `.ai-org/project/tasks.json` read during snapshot construction;
- the retained in-memory telemetry journal returned by `journal.readAfter(0)`;
- the active generated state-directory path for provenance.

This avoids opening a second journal, writing a generated view, probing account usage, or making another provider request on every Dashboard refresh. The journal is already bounded by the configured retention limit. Usage aggregation remains deterministic local computation.

The snapshot gains a top-level `usage` field. The private-viewer sanitizer may pass this object through because the usage-baseline contract already excludes prompts, hidden reasoning, source bodies, tool payloads, credentials, and raw provider payloads. The existing private-viewer removal of daemon, Inbox, and raw recent events remains unchanged.

## Dashboard rendering

Add a full-width `Usage & models` panel and a pure client-side `renderUsage(snapshot)` function. Rendering is defensive:

- a missing `snapshot.usage` is an unavailable legacy state, not zero;
- nullable numeric values render as `unknown`;
- compact integers use locale formatting;
- the summary renders qualification, qualified Work Items, detailed observations, registered completed-Work-Item coverage, total Tokens, and cost status;
- Token composition lists all five Token fields independently;
- driver groups render only when observations exist and expose bounded dimensions already present in the snapshot;
- the empty state explains how to obtain a correlated observation;
- non-authority copy explicitly states that savings, model-quality conclusions, routing, and automatic switching remain disabled.

No chart library or dependency is added. A time-series chart is deferred because the baseline contract currently contains a bounded aggregate and group first/last timestamps, not a normalized temporal series suitable for honest trend analysis.

## Verification

- Extend the HTTP snapshot test to assert a valid insufficient-data usage projection and no canonical mutation.
- Extend the Dashboard source contract test for the new panel, unknown-value formatting, qualification copy, and responsive rendering hook.
- Add a deterministic provider usage event to prove an observed model and Token group appear in the snapshot contract without retaining prompt-like content.
- Re-run Agent Command, current-state, private-viewer, and lifecycle tests through the full repository verification.
- Inspect the live self-host Dashboard at desktop width and 420px against the exact candidate.

## Risks

- **Refresh cost:** aggregation scans only the configured retained journal; no additional I/O over provider APIs or model inference is introduced.
- **Misleading zero:** all nullable fields use `unknown`; the observed count remains the only legitimate zero in the empty state.
- **Data disclosure:** only the existing usage-baseline projection crosses the private-viewer boundary; raw recent events remain removed.
- **Future contract drift:** rendering tolerates missing fields and does not infer unavailable model or cost data.
