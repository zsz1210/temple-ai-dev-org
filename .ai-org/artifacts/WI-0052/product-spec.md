# Product specification: provider-owned Codex execution bridge

## User problem

Temple can register a Codex task and inspect available history, but registration alone does not prove that the observing App Server owns the live session. Without a race-free subscription, detailed per-task Token usage can remain unavailable even when Work Item, Position, thread, and revision correlation are correct.

The user needs a trustworthy path that can later support one explicitly budgeted live proof. This slice establishes that path without performing the proof.

## Terms

### Codex-host-owned

A task created by Codex Desktop or another host before Temple registers it. Temple may read history or attempt resume, but the task is never described as provider-owned merely because registration succeeded.

### Temple-provider-owned

A non-ephemeral thread created on Temple's active local App Server connection. Temple registers the returned thread ID before it sends the first `turn/start` request. The same connection remains subscribed to that thread's turn, item, and usage notifications.

## Required launch behavior

The provider-owned operation accepts one bounded launch request containing:

- Work Item ID and Position ID;
- one non-empty instruction held only in memory for provider delivery;
- requested model and optional reasoning effort;
- exact task-launch revision;
- explicit approval and sandbox settings appropriate to the later live proof;
- actor and local Provider identity.

It performs exactly this sequence:

1. Confirm the local App Server provider is ready and the Work Item is eligible.
2. Call `thread/start` with a non-ephemeral thread, project working directory, requested model, and integration service name.
3. Register the returned thread ID as a canonical Temple task with execution origin `temple-provider-owned`.
4. Add that task to the provider's live correlation set and mark the attach outcome `live-attached` without calling `thread/resume`.
5. Call `turn/start` once with the in-memory instruction and requested turn configuration.
6. Return bounded task, thread, turn, model, and launch metadata; never return or retain the instruction body.

## Task metadata contract

New registrations preserve these concepts separately:

| Field | Meaning |
|---|---|
| `execution_origin` | `codex-host-owned` or `temple-provider-owned` |
| `provider_id` | Provider that owns or observes the execution when known |
| `requested_model` | Model requested for launch |
| `effective_model` | Effective model when the provider reports it; otherwise unknown; never copied from the request merely because launch succeeded |
| `reasoning_effort` | Requested/effective reasoning setting when known |
| `service_tier` | Provider service tier when known; the stable App Server launch surface does not currently accept this setting |
| `launch_revision` | Exact repository revision when the task began |
| `current_revision` | Latest candidate revision associated with the task |
| `base_revision` | Claim base revision, if the Work Item has an active claim |

Legacy task documents remain valid. Missing metadata stays `null`; it is not inferred from a title, display name, nearby task, or account-wide usage.

## Failure behavior

- If `thread/start` fails, no task is registered and no turn begins.
- If canonical registration fails, `turn/start` is not sent. The returned failure may identify the created provider thread, but must not contain the instruction.
- If `turn/start` is rejected, the registered task remains truthful and moves to an attention state with a bounded reason; Temple does not retry automatically.
- A transport acknowledgement failure is reported as unknown delivery rather than success.
- Existing host-owned attach failures continue to degrade to history-only or unknown and never trigger replacement task creation.

## Usage attribution

A detailed usage notification for a provider-owned thread correlates to the registered Work Item, task, Position, Agent, provider, and launch revision. Provider-reported model dimensions take precedence. Canonical requested/effective model, reasoning effort, and service tier may fill otherwise absent attribution dimensions, with provenance remaining explicit and missing dimensions still listed.

The Temple framework remains provider-neutral and does not hard-code one model family into initialized projects. For this repository's own development, the confirmed operating preference is GPT-5.6 models, with `gpt-5.6-luna` for lightweight work. This preference is recorded as project evidence and is not automatic-routing authority.

No account-wide usage value is allocated to the task. No price, monetary cost, savings, quality, or routing conclusion is produced by this slice.

## Privacy

Durable task state and telemetry may contain bounded identifiers, model settings, revision identifiers, statuses, instruction length, and a non-content summary such as `instruction-not-retained`. They must not contain raw prompts, hidden reasoning, command output, source bodies, credentials, full provider payloads, or the instruction text.

## Interface and release boundary

This work has no user-facing interface (`not-applicable`). It adds no Dashboard control and no remote mutation path. Passing fake-server tests proves local orchestration semantics only. Thread visibility in Codex Desktop and real detailed Token notifications remain unverified until a separately authorized live proof.
