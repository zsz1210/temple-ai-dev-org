# Human approval — WI-0061

- Approval source: the user explicitly approved the WI-0061 proposal in the current Codex conversation on 2026-08-31.
- Approved local path: `<LOCAL_HOME>/Documents/ChatGPT/temple-effectiveness-lab/instrumentation-pilot`
- Approved model profile: `gpt-5.6-luna` with `max` reasoning
- Approved execution: one Provider-owned Codex task, one launch attempt, one model turn, and zero retries
- Approved Token boundaries: warning at 40,000 and stop at 60,000 Provider-reported total Tokens when observable
- Approved time boundaries: 15 minutes for the task and 45 minutes for the complete local pilot
- Approved disk boundary: 250 MiB additional local storage
- Approved success gate: the minimum task-level correlation listed in `pilot-proposal.md`

## Authority boundary

This decision authorizes a separate execution Work Item only within the approved proposal. It does not authorize a paid API key or pay-as-you-go credential, a usage reset, GitHub or hosted CI, another machine, company or production data, external writes, push, deployment, publication, public release, automatic routing, fallback, or retry.

The existing signed-in Codex entitlement may be consumed. Temple can report Provider Token telemetry when available, but it cannot infer monetary billing or guarantee that account-plan treatment is free.
