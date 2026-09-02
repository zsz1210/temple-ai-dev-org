# Live Managed-Local Observation — WI-0092

## Installed boundary

- Source candidate: `5e74864527cb2422aac67804efda3583194e6a58`
- Integration merge: `27b6d666917161c2226321ae5b79a943a6db71c9`
- Corrected exact runtime candidate: `ad88803703fb8dc311229b3f10d7aed751837f2b`
- Mode: `managed-local`
- LaunchAgent label: `dev.temple.observer.10567c0c355a`
- Installed plan digest: `sha256:6510b76a105d7d5353648bc9bd30b4e8567fa671e3b8b097983f8dc6bb6c0e7e`
- Loopback: `127.0.0.1:8766`
- Private home-LAN viewer: `192.168.79.5:41741`
- Status after candidate restart: `running`

## Runtime results

- The private viewer accepted GET and rejected POST with HTTP 405.
- Its snapshot exposed no Human Inbox, recent-event content, Principal details, or reviewed local-path marker.
- Initial inspection found that `usage.source.state_directory` still crossed the private-viewer boundary. Independent QA withheld approval and opened corrective child WI-0093.
- After WI-0093, the private snapshot omitted `state_directory`, while loopback retained the exact local directory for diagnosis.
- Usage remained truthful: 47,726 observed Tokens, two detailed observations, and two captured completed Work Items out of 82.
- The capture-health state was `ready-no-live-task`; no active task was falsely claimed.
- Work Item backfill remained unsupported and account-wide usage remained unallocated.
- The service retained neither raw prompts nor hidden reasoning under its declared privacy contract.
- No canonical repository state or external system was changed by the observation request.

## Measured limitation

One live snapshot measured about 1.864 MB and 38.293503 seconds; subsequent inspection remained in the tens-of-seconds range while retained history was scanned. This is acceptable for the bounded Alpha observation proof, but it is not a low-latency result. Performance and payload reduction remain follow-up work.

The managed-local service remains active because the user asked to retain continuous local observation. Removal remains explicit and separately consented.
