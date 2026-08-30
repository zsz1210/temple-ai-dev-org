# UI design brief — WI-0042

- Delivery mode: `code-first`
- Surface: existing private read-only Dashboard
- Visual change: none intended
- New presentation requirement: the transport label must distinguish `private-lan` from `tailscale-serve` in API state without exposing a user identity
- Required states: loading, current, stale, and offline remain visually distinct
- Runtime review: desktop `1440 × 1000` and tablet/narrow `420 × 900`
- Acceptance: no Human Inbox or Agent Command controls appear, current data remains readable, no horizontal page overflow appears, and no browser console error is produced

The implementation reuses the existing private-viewer page. It does not introduce a design-vendor dependency or authorize a Dashboard redesign; the broader Dashboard review begins only after this access slice is verified.
