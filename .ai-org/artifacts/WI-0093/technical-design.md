# Technical Design — WI-0093

## Design

`privateViewerSnapshot` already clones the full loopback snapshot and removes private top-level sections before serving either Tailscale or home-LAN clients. At that shared redaction boundary, delete only `safe.usage.source.state_directory` when the nested objects exist.

This keeps the canonical Usage baseline and loopback diagnostics unchanged. It also keeps one policy for both private transports and avoids altering provider capture, history, or attribution.

## Verification

Extend the existing home-LAN and Tailscale snapshot assertions:

- private response does not own `usage.source.state_directory`;
- serialized private response does not include the fixture state directory;
- local loopback response still reports the exact fixture state directory;
- existing Inbox/event/principal redaction and 405 mutation checks remain.

Then run the focused private-viewer test, full repository verification, browser gate, and live managed-local LAN inspection.
