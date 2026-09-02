# Product Direction — WI-0091

## User problem

The Usage view shows a retained Token total without making it obvious that the current Codex observation path is disabled. A reader can reasonably interpret an unchanged number as a refresh problem or as the complete cost of recent work. Both interpretations are wrong.

## Product outcome

Usage must answer two separate questions before showing analysis:

1. **Is Temple collecting detailed Token observations now?**
2. **How much completed project work is represented by the retained observations?**

Historical evidence remains visible when capture is off, but it must be labelled as historical rather than live. Missing work remains excluded and is never represented as zero.

## Human-readable states

| State | Meaning | Primary copy |
| --- | --- | --- |
| `capturing` | The Codex Provider is ready and at least one eligible registered task is live-resumable. | Capturing active tasks |
| `ready-no-live-task` | The Provider is ready, but there is no eligible active task to observe. | Ready for the next registered task |
| `historical-only` | Retained observations exist, but the current Provider cannot collect new detailed usage. | Historical data only |
| `not-capturing` | No retained detailed observation exists and the current Provider cannot collect one. | Token capture is off |

The Provider status and reason remain available as supporting evidence. `disabled` is an intentional opt-in state, not a system failure. `offline` or an unavailable capability must not be softened into readiness.

## Coverage

Coverage is the number of distinct completed Work Items with correlated detailed Token observations divided by all completed canonical Work Items. It is not the number of registered tasks and it is not the qualification threshold.

The view must keep these concepts separate:

- **Captured completed work:** representativeness of the retained totals.
- **Qualified Work Items:** evidence available for later longitudinal comparison.
- **Observations:** detailed Provider events actually included.
- **Monetary cost:** unavailable until a separately approved price source exists.

## Recovery and limits

- When capture is not active, tell the operator to enable Codex observation before the next registered task starts.
- When the Provider is ready but no task is live, say that no active registered task is available rather than describing the Provider as disconnected.
- Existing repository events, elapsed time, generated text, account-wide activity, and completed unobserved tasks cannot be used to reconstruct per-Work-Item Tokens.
- Account-wide usage remains unallocated and cannot improve project coverage.

## Accepted scope

The acceptance criteria in `.ai-org/work-items/WI-0091.json` are approved as written. No model-routing, pricing, release, command-gateway, or public-access behavior is added by this Work Item.
