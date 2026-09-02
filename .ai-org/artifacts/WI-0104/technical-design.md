# WI-0104 technical design

## Architecture

One repository-local Node.js script creates a disposable experiment root containing four independent Git repositories:

```text
coordinator ── exact refs ──> catalog ── Availability v1/v2 ──> orders
     │                                                       │
     └──────── aggregate scenarios <─────────────────────────┴─ OrderPlaced v1 ──> notifications
```

The three services run in one Compose project on an `internal: true` network. No service publishes a host port. A short-lived scenario-runner container joins the same network, calls service DNS names, and writes JSON only to stdout. All service code uses the Node.js standard library.

## Repository fixture

The script must:

1. create the four repositories under an operating-system temporary directory;
2. initialize each with Temple through the current framework source and an explicit local config;
3. keep Rikku as Developer and Lulu as Independent QA;
4. create one bounded `WI-0001` per participant so federation references resolve;
5. add only the minimal source, tests, container file, contracts, and coordinator scenario assets;
6. run each native `node --test` suite;
7. commit Catalog v1 and v2 plus Orders v1-only and compatible states independently, run the native suite once for every distinct revision, and record every exact SHA;
8. write a coordinator federation registry with exact participant revisions, contract ownership, dependencies, and consumer-first rollout waves;
9. validate the registry and build a read-only portfolio before containers start; and
10. keep every participant clean throughout runtime execution.

The fixture is generated at runtime and deleted after the observation is safely written. Product files do not become Temple package content.

## Container contract

- Runtime profile: Colima `temple-wave3`, Docker runtime, no Kubernetes, 2 CPU, 2 GiB memory, 10 GiB sparse disk, no autostart.
- Docker target: use the explicit `colima-temple-wave3` context for every pull, inspect, build, Compose, and cleanup command; never inherit an ambient Docker context.
- Base: one official Node 24 Alpine image pinned by immutable registry digest before the candidate is accepted.
- Images: one per service, built from independent repository contexts; a shared base layer is expected but not counted as three separate downloads.
- Runtime hardening: internal network, no host ports, read-only root filesystem, temporary `/tmp`, non-root Node user, bounded PIDs, memory, and CPU.
- Health: `/health` returns service, configuration, and readiness without credentials or environment dumps.
- Startup: Compose validates configuration, builds, starts services, and waits for health before a scenario.

## Versioned rollout

Catalog v1 and v2 and Orders v1-only and compatible are real Git revisions. The runner checks out and rebuilds only the repository whose candidate changes:

1. Catalog v1 + Orders v1-only: pass.
2. Catalog v2 + Orders v1-only: explicit `unsupported_catalog_contract`, no notification delta.
3. Catalog rollback to v1: pass.
4. Orders compatible while Catalog remains v1: pass.
5. Catalog switch to v2 after consumer compatibility: pass.

Notifications remains available across these cases. Its malformed-event case captures state before and after rejection, then submits a valid event to prove recovery.

The coordinator commits a compact experiment journal and federation registry. After live execution, the script starts a fresh child process with `--inspect <experiment-root>`; that process may read only the retained repository files and Git history, and must reconstruct the participant revisions and aggregate outcome without in-memory state.

## Observation

The output schema is purpose-specific and includes:

- framework, runtime, Docker, Compose, and base-image versions/digests;
- host free bytes and experiment/VM disk observations before and after;
- per-stage elapsed milliseconds;
- participant project IDs, paths reduced to fixture-relative names, exact revisions, clean status, native tests, and Doctor summaries;
- federation validation and portfolio summary;
- Compose config/build/health results;
- scenario request/response summaries with no arbitrary bodies;
- image sizes and final container/network/volume state;
- cleanup attempted/succeeded and residual paths;
- model and Token fields marked `not_applicable`.

The script writes the retained output only after validating it and always attempts Compose teardown in `finally`. The outer operator then stops and deletes the dedicated Colima profile after image and cleanup observations are captured.

## Stop and failure behavior

No retry is automatic. On failure, capture the failing command, bounded stderr, service health, and bounded Compose logs; tear down the Compose project; write a stopped observation if possible; and retain no participant repository. Exceeding 10 minutes or 5 GiB measured host growth is a stopped result.

## Repository integration

The validation script is standalone and explicit. It is not added to hosted CI or `npm run verify`, because it requires an optional local runtime, network image pull, and several minutes of lifecycle work. Ordinary repository verification checks its syntax and documentation boundaries; its real execution is separately retained under WI-0104.

## Risks and mitigations

- **Disk growth:** dedicated 10 GiB profile, small shared base, measurement, teardown, and profile deletion.
- **Accidental exposure:** internal Compose network and no `ports` entries.
- **Moving image tag:** resolve and pin the immutable digest before acceptance.
- **False distributed claim:** four repos share one host; the result remains local-only.
- **Fixture drift:** exact revisions, clean checks, federation validation, and cold aggregate inspection.
- **Host configuration drift:** record installed versions and do not make Colima or Docker a Temple dependency.

## Rollback

Delete only the disposable fixture and the `temple-wave3` Colima profile, then revert the WI-0104 repository commits. Do not run broad Docker prune commands because they could remove unrelated user data.
