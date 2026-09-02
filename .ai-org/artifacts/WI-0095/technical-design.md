# Technical Design — WI-0095

## Design

Keep one CLI integration test with two native-host branches:

- On `darwin`, execute the existing plan, install-without-activation, status, and exact-removal sequence unchanged.
- On any other `process.platform`, require exit code 1, parse the JSON response, verify `unsupported-platform`, `supported: false`, the native platform value, and `managed-local`, then prove that neither the service manifest nor LaunchAgent directory exists.

The product code remains unchanged. Unit coverage that injects `platform: "linux"` continues to verify deterministic unsupported planning independently of the native CI branch.

## Verification

Run the focused test on macOS, the complete local repository verification, then push the exact correction so Linux GitHub runners execute the unsupported-host assertions on Node.js 22 and 24.
