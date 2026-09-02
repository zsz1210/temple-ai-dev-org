# Risk Review — WI-0093

| Risk | Mitigation |
| --- | --- |
| Remove a field from loopback diagnostics | Redact only inside `privateViewerSnapshot`; assert loopback retains the exact path. |
| Fix LAN but miss Tailscale | Both transports call the same redaction function; assert both serialized snapshots. |
| Hide useful Usage measurements | Delete only `state_directory`; retain totals, history, coverage, capture health, gaps, and privacy flags. |
| Future nested path regression | Add integration assertions against both the property and serialized absolute fixture path. |
| Treat a privacy failure as documentation-only | Require live LAN inspection and Independent QA before release closeout. |

The change does not alter UI layout, service installation, telemetry, network exposure, or mutation authority.
