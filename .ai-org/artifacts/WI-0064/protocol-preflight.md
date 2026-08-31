# Protocol preflight — WI-0064

- Observed at: 2026-08-31
- Installed CLI: `codex-cli 0.151.0-alpha.7.2`
- Generation command: `codex app-server generate-json-schema --out <temporary-directory>`
- App Server initialize: pass
- `model/list`: 7 models observed
- `gpt-5.6-luna`: present
- Supported Luna reasoning efforts: `low`, `medium`, `high`, `xhigh`, `max`
- Generation performed: no

## Exact local schema digests

| Schema | SHA-256 |
|---|---|
| `ThreadStartParams.json` | `792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd` |
| `TurnStartParams.json` | `a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea` |
| `ThreadStartResponse.json` | `c8fb6bcd1e4fb5ead6b487f0f35a90d8f13c9272edd4285914012dda403a77d2` |
| `ModelReroutedNotification.json` | `37cd3c1b3a3560b85b01d4061a07d830fc9ed93b80e4663f975f9197cdb501ef` |
| `ThreadTokenUsageUpdatedNotification.json` | `aba4f6c7e4a19b2b842c08ee793b57000c07dafd57b922ad0d8e7c76609108c2` |

The generated `ThreadStartResponse` requires top-level `model` and `modelProvider`; `reasoningEffort` and `serviceTier` are nullable. The generated reroute notification requires `threadId`, `turnId`, `fromModel`, `toModel`, and `reason`. These are the exact fields used by WI-0063 and required by the WI-0064 runner.

Preflight outcome: pass. This authorizes no more than the one launch attempt in the approved work order.
