# Dashboard reliability dogfood

- Work Item: `WI-0009`
- Candidate revision: `987186756be5c996f0a12438c7a5b13aa8c7030d`
- Environment: Temple self-host repository, local loopback Control Plane, Codex App Server, Codex in-app browser
- Result: passed with retained provider limits

## What was validated

Temple used its own lifecycle and evidence model to correct two misleading operational behaviors: completed work appeared queued, and optional Codex history reconciliation delayed the HTTP surface. The candidate introduces terminal work semantics, HTTP-first startup, bounded history reconciliation, and configuration validation without making telemetry authoritative.

The exact candidate passed the 152-test repository suite in a clean detached worktree. The live self-host Dashboard became reachable in the first one-second observation window, returned HTTP 200 for health and snapshot, showed eight completed Work Items as `terminal`, left only WI-0009 queued, and rendered the Terminal metric and badges correctly in the in-app browser.

The clean runtime journal first exposed 175 retained events while synchronization was underway and later remained bounded by canonical repository events plus the 20-turn and 200-item reconciliation window. It did not repeat the prior multi-thousand-event startup import.

## Retained limits

- The historical registered task could be read, but its later live `thread/resume` request returned App Server error `-32600`; Temple truthfully displayed degraded provider health.
- The run does not prove live attachment to every current or historical Codex task.
- Long-duration soak, large-journal performance, crash-at-write boundaries, cross-machine observation, and production retention remain unverified.
- Runtime telemetry remains generated local state and cannot satisfy a lifecycle gate.
