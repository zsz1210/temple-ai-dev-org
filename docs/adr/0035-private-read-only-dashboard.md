# ADR-0035: Separate private Dashboard viewing from remote Agent control

## Status

Accepted.

## Context

The local control plane is useful on the development machine, but a project owner may need to observe it from a tablet or another trusted device. Binding the existing server to a LAN or tailnet interface would also expose the Human Inbox, its per-process session secret, and the Agent Command prototype. Treating private transport as mutation authority would collapse observation and control into one unsafe boundary.

Temple should not make one VPN vendor a core dependency. It can nevertheless support an optional, pinned private reverse-proxy adapter when the adapter preserves the framework's localhost and authority boundaries.

## Decision

Temple adds a private read-only viewer distinct from the loopback Dashboard.

- The HTTP server continues to bind only to `127.0.0.1`.
- A private-viewer request must use one exact runtime-configured `*.ts.net` Host and contain the user identity header inserted by Tailscale Serve.
- The backend trusts that identity header only while it remains unreachable from LAN and tailnet interfaces directly.
- The private page contains no Human Inbox, Agent Command controls, session secret, or mutation client.
- Its snapshot excludes Inbox state, daemon filesystem metadata, and raw recent events.
- Its SSE channel carries refresh notifications only. Clients obtain state from a newly redacted snapshot.
- Every private-viewer non-GET request and Inbox route is rejected before command parsing.
- The loopback Dashboard retains its existing behavior and command defenses.
- The optional launcher is pinned to Tailscale CLI `1.98.8`, invokes only tailnet-private `tailscale serve`, refuses pre-existing Serve configuration, verifies the resulting loopback proxy, and resets only the configuration it created on shutdown.
- Temple never invokes Tailscale Funnel, changes a tailnet policy, starts itself at login, or grants remote command authority.

Tailscale is not vendored. The open-source client is BSD-3-Clause licensed; account and service terms remain external to Temple.

## Consequences

An authenticated device on the same permitted tailnet can observe current project state over HTTPS without turning the Dashboard into a remote-control plane. Operators must still restrict access using Tailscale grants because a tailnet's default policy may allow every member device to reach the Serve endpoint.

Remote Agent Commands remain a separate future decision. They require application-level authorization, exact target and turn preconditions, explicit confirmation, short-lived capability, audit, revocation, and real-device failure testing. Private connectivity alone grants none of those permissions.

The exact Tailscale version pin must be intentionally reviewed and updated as the integration is revalidated. Existing Tailscale Serve configuration is not merged or overwritten automatically.
