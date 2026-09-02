# Work Order — WI-0093

## Problem

The live home-LAN private viewer returned `usage.source.state_directory`, exposing the clone's absolute local Control Plane path. Inbox, recent events, service definitions, and mutations were already withheld, but this nested Usage field violates the private-viewer path-redaction boundary.

## Authorized scope

- Remove the clone-local Usage state-directory value from both Tailscale and home-LAN private snapshots.
- Preserve the value in loopback snapshots for local operator diagnostics.
- Add regression coverage to the existing private-viewer integration tests.
- Re-run exact-candidate tests and the live managed-local LAN boundary.

## Exclusions

- No repository visibility, tag, release, announcement, or npm action.
- No change to Token attribution, telemetry retention, service installation, or LAN mutation policy.
- Do not stop or uninstall the approved managed-local Observer.

## Stop condition

Stop if removing the field changes loopback diagnostics, damages the Usage schema, or requires a broader public API redesign.
