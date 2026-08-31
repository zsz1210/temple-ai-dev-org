# Work order: Preserve Token history across telemetry rebuilds

- Work Item: `WI-0058`
- Owner: Engineering Manager / Mog
- Delivery: sequential on `main`
- Base revision: `1631f8abda63e3421aad9273b9ad3eb2209bdb4a`
- Specification mode: `gate-evidence`
- UI delivery mode: `code-first`

## Outcome

Keep provider-reported Token observations visible in Temple Workspace and `temple usage report` after a Control Plane rebuild moves the old journal into the local archive.

## Boundaries

- Read only direct, timestamp-named local journal archives under the resolved Control Plane state directory.
- Extract a strict minimum projection of normalized `org.temple.codex.usage.updated.v1` events.
- Do not copy archive records into the active journal, repair old cursors, or modify an archive.
- Do not retain or expose prompt, instruction, response, command, tool, hidden-reasoning, or arbitrary payload content.
- Do not let archived telemetry satisfy lifecycle gates, change canonical state, recommend a model, estimate cost, or authorize routing.
- Do not perform another model turn, external write, release, publication, deployment, or push.

## Coordination

The overlapping Control Plane and Workspace Work Items are unclaimed earlier candidates already contained in the base revision. `WI-0058` is the sole current editor, preserves their accepted contracts, and records the later tested revision as the integration base for any resumed work.

## Stop condition

Stop when deterministic tests, a fresh Independent QA run, and a local runtime visual review prove that the preserved `WI-0056` observation appears as `23,433` total Tokens after rebuild, with bounded archive coverage diagnostics and no archive mutation.
