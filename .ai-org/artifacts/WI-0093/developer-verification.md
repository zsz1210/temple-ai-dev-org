# Developer Verification — WI-0093

- Developer: Rikku (`agent-rikku`)
- Candidate: recorded by the subsequent Developer handoff
- UI mode: `not-applicable`

## Change

`privateViewerSnapshot` now deletes only the nested `usage.source.state_directory` field after cloning the local snapshot. Loopback data remains unchanged.

The existing live integration tests now require:

- home-LAN and Tailscale snapshots to omit the property;
- serialized private responses to omit the absolute fixture state directory;
- the loopback response to retain the exact local state directory;
- all existing private-viewer authority and redaction checks to remain green.

## Pre-candidate result

`node --test test/control-plane-private-viewer.test.mjs` passed 5 tests with 0 failures. The full exact-candidate suite, browser gate, and live managed-local rehearsal are required after commit.
