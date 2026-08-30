# UI brief — WI-0029 Agent Commands

## Audience and job

The primary user is a developer or engineering manager watching registered Codex work from the local Temple Dashboard. They need to send one deliberate instruction to the correct existing task and understand how far that instruction actually progressed.

## Information hierarchy

1. Feature availability and the reason it is unavailable.
2. Exact registered target: task, Work Item, Position/Agent, provider thread, current task status, Work Item state, and active turn when applicable.
3. Operation choice: new turn, steer active turn, or interrupt active turn.
4. Instruction editor for new turn and steer, including current and maximum character count.
5. Local preview plus a warning that secrets must not be entered.
6. Explicit confirmation checkbox and one submit action.
7. Recent commands with separate transport and observed execution states.

## Required state coverage

| State | Required presentation and behavior |
|---|---|
| Disabled by configuration | Explain that commands are opt-in; no form or submit action is enabled. |
| Provider offline or degraded | Explain that observation may remain available but command delivery is unavailable. |
| No eligible registered target | Explain that completed, archived, terminal, and unregistered tasks cannot receive commands. |
| Eligible idle task | Offer `new-turn`; hide or disable `steer` and `interrupt` without an active turn. |
| Eligible active task | Offer `steer` and `interrupt` with the exact active turn shown. Do not offer a conflicting new turn. |
| Empty, oversized, or unconfirmed instruction | Show local validation and keep submit disabled. |
| Preview ready | Show operation, exact target, complete local instruction preview, retention notice, and explicit confirmation. |
| Submitted | Disable repeat submission while awaiting the first response. |
| Provider accepted | State that the provider acknowledged the request, not that the Agent completed it. |
| Turn started | Show the provider turn ID and `turn-started`; completion remains pending. |
| Completed | Show an observed terminal success and its observation time. |
| Failed | Show an observed provider failure without exposing raw provider payloads. |
| Interrupted | Show that the provider observed the turn ending as interrupted. |
| Provider rejected | Explain that the provider explicitly rejected the request and no automatic retry occurred. |
| Delivery unknown | Warn that the request may or may not have arrived; prohibit automatic retry and tell the user to inspect the target task before deciding. |
| Stale target or turn | Reject before dispatch, refresh the target projection, and require a fresh confirmation. |
| Idempotent replay | Return the original result and label it as a replay, without a second provider call. |

## Interaction and accessibility

- Use native labels, select, textarea, checkbox, button and status text.
- Preserve keyboard operation and visible focus behavior.
- Do not encode delivery state by color alone; always render a textual state.
- Confirmation is never preselected.
- Destructive interruption receives visually distinct treatment.
- Changing target, operation, or instruction clears the prior confirmation.
- The full instruction exists only in the transient browser form and provider conversation; the Dashboard history displays a bounded redacted preview.

## Runtime review

Review at desktop and narrow responsive widths. Verify the disabled state first, then use a deterministic local fake provider to exercise idle, active, accepted, unknown-delivery, rejected, and terminal histories. A real Codex task is not part of this UI review unless separately authorized.
