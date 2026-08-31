# Technical design: provider-owned Codex observability bridge

## Official protocol basis

The stable Codex App Server lifecycle separates thread creation from generation:

- `thread/start` creates a new thread, emits `thread/started`, and subscribes that connection to turn and item events for the thread;
- `turn/start` adds input and begins generation;
- `thread/tokenUsage/updated` reports usage updates for the active thread;
- thread and turn requests accept explicit model, working directory, approval, sandbox, and reasoning settings on the documented stable surface.

The bridge uses that separation as its transaction boundary. It does not assume that an App Server-created thread appears in Codex Desktop because the official protocol does not promise that presentation behavior.

## Components

### Canonical task contract

`src/tasks.mjs` adds validated optional metadata to `temple.tasks/v1` records while preserving legacy compatibility:

- `execution_origin`: `codex-host-owned` or `temple-provider-owned`;
- `provider_id`;
- `requested_model` and `effective_model`;
- `reasoning_effort` and `service_tier`;
- `launch_revision`, separate from existing `base_revision` and mutable `current_revision`.

Ordinary `temple task register` defaults to `codex-host-owned`. New CLI flags allow explicit metadata registration without creating any provider session. `task update` may refresh the current revision and effective provider dimensions but may not rewrite the launch revision or execution origin.

`src/doctor.mjs` validates known execution origins and bounded nullable strings. A `temple-provider-owned` task requires a Provider ID, stable thread ID, and launch revision. Existing records without the new fields remain valid.

### Provider launch method

`startCodexAppServerProvider` exposes `launchProviderOwnedTask(request)` only after its App Server handshake reaches `ready`.

The method:

1. Validates bounded request fields and rejects empty or oversized instructions.
2. Sends `thread/start` with the project root, requested model, explicit approval policy, sandbox mode, and `serviceName: "temple-control-plane"`. The stable protocol creates a durable thread by default; the bridge rejects an explicitly ephemeral response instead of sending an undocumented `thread/start.ephemeral` field.
3. Uses the project mutation lock and the existing task registrar to create a canonical active task with provider-owned metadata.
4. Adds the registered task to the provider's in-memory correlation set and records `live-attached`; it never calls `thread/resume` for this new thread.
5. Sends one `turn/start` with the thread ID, in-memory text input, model, reasoning effort when present, working directory, approval policy, and sandbox policy.
6. Returns bounded identifiers and configuration plus `instruction_retained: false` and `automatic_retry: false`. Requested model remains distinct from effective model; the latter stays unknown unless the Provider reports it.

The provider receives injectable task-register and task-update functions for deterministic failure testing. Production defaults remain the existing canonical mutation functions.

### Failure semantics

The operation is intentionally not an all-or-nothing provider transaction because `thread/start` creates provider state before canonical registration can run.

- Thread creation failure: return a bounded `thread-start-failed`; no canonical task and no turn.
- Registration failure: throw `task-registration-failed` with the created thread ID and `turn_started: false`; do not delete or archive the provider thread automatically.
- Turn rejection: retain the canonical task, set it to `attention` with a non-content bounded note, and return `provider-rejected` with no retry.
- Transport acknowledgement loss: retain the task and report `delivery-unknown`; do not infer completion or retry.

No error or task note contains the instruction text or raw Provider message.

### Correlation and usage

The provider's task collection becomes mutable for tasks created after startup. The new task enters the collection before `turn/start`, so streamed turn, item, plan, diff, and usage notifications correlate to the correct Work Item and task even when they arrive before the `turn/start` response.

Usage attribution prefers Provider event dimensions, then canonical effective/requested model, reasoning effort, and service tier. Canonical fallback fields are explicitly identified as task metadata and do not turn account-wide usage into project evidence. The stable App Server launch contract does not expose a service-tier input, so provider-owned launch keeps that dimension unknown until observed. The scope revision for launch-time events is `launch_revision`; later task updates may associate candidate evidence with `current_revision`.

The live observer exposes origin, model, reasoning, and the three distinct revisions for a future separately governed UI slice. This Work Item does not change the human-facing console. A later UI may display canonical requested/effective model when no usage event exists, but it must label that value as configured rather than observed.

## Privacy controls

- The instruction exists only in the method call and JSON-RPC `turn/start` request.
- Canonical state stores no prompt or instruction hash.
- Telemetry stores no prompt, raw response, hidden reasoning, or full Provider payload.
- Failure tests use a unique marker and assert that it is absent from task JSON, events, journal records, and Provider registry output.
- Instruction length is limited to 4,000 characters; there is no automatic retry.

## Fake App Server verification

The fixture records JSON-RPC method order and responds to `initialize`, `thread/start`, and `turn/start`. It emits `thread/started`, `turn/started`, and one `thread/tokenUsage/updated` notification.

Focused tests prove:

1. `initialize -> thread/start -> task registration -> turn/start` ordering;
2. provider-owned task metadata and revision separation;
3. live attachment without `thread/resume`;
4. exact usage correlation and model/reasoning fallback;
5. no turn after registration failure;
6. attention without retry after Provider turn rejection;
7. no instruction retention;
8. host-owned registration and degraded attach behavior remain compatible.

Full `npm run verify`, Doctor, and a fresh detached-worktree run provide the final evidence. No test starts the real `codex` command.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Provider thread exists after registration failure | Return its bounded ID, never start a turn, and require explicit later cleanup rather than destructive automation. |
| A notification arrives before registration | Only `thread/started` may precede registration; the task enters the correlation set before generation begins. |
| Requested and effective model diverge | Keep separate fields, prefer Provider dimensions, and retain unknown rather than infer an unavailable version or service tier. |
| A remote Dashboard could launch work | No HTTP route or Dashboard control is added; provider launch remains a local programmatic primitive. |
| Synthetic success is mistaken for live support | Completion documentation explicitly retains Desktop visibility and real Token delivery as unverified. |

## Rollback

Revert the source, test, and documentation candidate commit. Project-owned task records created by future live experiments would not be deleted automatically; this Work Item creates none.
