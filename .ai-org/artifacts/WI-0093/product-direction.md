# Product Direction — WI-0093

## User outcome

A person opening Temple from another device on the private LAN can inspect Usage health without learning the host Mac's username, clone location, or Control Plane storage path.

## Accepted behavior

- Tailscale and home-LAN private snapshots keep Usage totals, capture health, gaps, model fields, and explicit privacy flags.
- They omit `usage.source.state_directory`.
- The loopback snapshot retains `usage.source.state_directory` because it is an operator-local diagnostic.
- Existing private-viewer read-only behavior, Inbox/event redaction, and HTTP 405 mutation rejection remain unchanged.

## Acceptance

The existing integration fixtures must fail on the pre-fix behavior and pass only when both private transports omit the field. A live managed-local LAN response must contain no `/Users/`, LaunchAgent path, service label, or observer manifest path.
