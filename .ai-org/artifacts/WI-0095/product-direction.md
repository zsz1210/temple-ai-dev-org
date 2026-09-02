# Product Direction — WI-0095

## User outcome

Contributors can trust the same CI workflow on macOS development hosts and Linux GitHub runners without Temple claiming a managed service that the host cannot provide.

## Accepted behavior

- `observer-plan` remains successful on macOS and exposes the exact service plan.
- On Linux or another unsupported host, `observer-plan --json` returns a structured `unsupported-platform` result and exit code 1.
- Unsupported-host preview creates neither an Observer manifest nor a LaunchAgent directory.
- No Linux installation path or broader platform-support promise is added.

## Acceptance boundary

The existing macOS lifecycle assertions and focused local test must remain green. Hosted Node.js 22 and 24 must exercise the unsupported-host branch successfully, and the Node.js 24 browser gate must remain green.
