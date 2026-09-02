# Required State Coverage — WI-0092

| Selected mode | Provider | Retained detail | Post-start uncaptured work | Expected result |
| --- | --- | ---: | ---: | --- |
| Off | Disabled | No | N/A | Framework available; Token observation off; missing remains unknown. |
| Off | Disabled | Yes | N/A | Historical data remains visible; no current capture implied. |
| On demand | Ready, no live task | Any | 0 | Ready for the next explicitly registered task. |
| On demand | Ready, live task | Any | 0 | Capturing active tasks; notification still required before totals change. |
| Managed local | Ready | Any | 0 | Service running; post-start correlated coverage is clear. |
| Managed local | Ready | Any | One or more | Service may be running, but accepted work lacks correlated detailed evidence. |
| Managed local | Degraded/offline | Yes | Any | Retained history plus managed service attention; no fabricated backfill. |
| Managed local | Degraded/offline | No | Any | No detailed data and managed service attention. |

Additional cases:

- Work completed before managed installation affects all-time coverage but not the post-start gap.
- Account daily buckets never change the gap or Work Item coverage.
- An external Codex task without canonical registration remains unallocated.
- Removing the managed service returns selection to Off after the current process stops; retained telemetry remains.
- Unsupported platforms can plan only an unsupported result and write nothing.
- Private LAN snapshots omit plist path, manifest path, executable paths, service label, logs, and mutation commands.
