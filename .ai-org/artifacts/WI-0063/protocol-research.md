# App Server effective-model protocol evidence

- Official lifecycle: <https://developers.openai.com/codex/app-server/>
- Inspected CLI: `codex-cli 0.151.0-alpha.7.2`
- Generated schema command: `codex app-server generate-json-schema --out <temporary-directory>`
- Observation date: `2026-08-31`

## Installed schema digests

| Schema | SHA-256 |
|---|---|
| `v2/ThreadStartResponse.json` | `c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2` |
| `v2/ModelReroutedNotification.json` | `37cd3c1b3a3560b85b01d4061a07d830fc9ed93b80e4663f975f9197cdb501ef` |
| `v2/ThreadTokenUsageUpdatedNotification.json` | `aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2` |
| combined v2 schema | `2442b15801bc019ad55987ad03e0f0ae60c51417825b9b6d708db640e6c2651c` |

## Confirmed fields

`ThreadStartResponse` requires top-level `model` and `modelProvider`; it also exposes nullable `reasoningEffort` and `serviceTier`. Its nested `thread` exposes `modelProvider` but not the effective model field Temple previously attempted to read.

`ModelReroutedNotification` requires `threadId`, `turnId`, `fromModel`, `toModel`, and `reason`. The current installed reason enum contains `highRiskCyberActivity`. The official documentation likewise identifies `model/rerouted` as the event emitted when the service routes a request to another model.

`ThreadTokenUsageUpdatedNotification` contains thread, turn, numeric Token usage, and context-window fields but no model field. Effective model must therefore come from the Provider acknowledgement and any later reroute event, not from Token usage and not from the original request alone.
