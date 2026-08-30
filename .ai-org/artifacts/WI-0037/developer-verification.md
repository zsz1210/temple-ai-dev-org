# Developer verification — WI-0037

- Candidate revision: `2b48a14aca01c0e98200c0b0424fb5b47636f9fc`
- Developer: Rikku (`agent-rikku`)
- Result: **pass to Quality & Evaluation**

## Root cause and correction

The core CLI originally used one-shot signal listeners. A repeated terminal signal could restore Node's default termination behavior while Tailscale Serve reset was still running. After the core latch was corrected, real PTY verification exposed a second boundary: `templew.mjs` synchronously waited for its CLI child and could terminate before that child completed cleanup.

The final candidate keeps the core `SIGINT` and `SIGTERM` latch active until Serve and the local listener have both closed. The version-pinned launcher now awaits its child, retains parent signal handlers for the child's lifetime, forwards stop signals, preserves normal and signal exit statuses, and removes its handlers when the child settles.

## Automated evidence

Focused CLI, launcher, and private-viewer coverage passed 40/40. The launcher integration test sends repeated stop signals to the parent while its child performs delayed cleanup and proves that the marker is written before exit status 0.

The full repository gate passed:

```text
npm run verify
tests 216
pass 216
fail 0
skipped 0
duration_ms 43758.580541
```

Repository checks and documentation-link checks also passed.

## Live shutdown evidence

The candidate started the real private Dashboard at `https://mac-mini.tail54c6fc.ts.net` with a loopback target on port `65191`. A single PTY `Ctrl-C` then produced:

```text
launcher exit status: 0
tailscale serve status --json: {}
former loopback port: connection refused (curl exit 7)
```

This is the same path that failed before the launcher correction. The check proves bounded local cleanup on this macOS host; it does not authorize public exposure, automatic startup, deployment, or release.
