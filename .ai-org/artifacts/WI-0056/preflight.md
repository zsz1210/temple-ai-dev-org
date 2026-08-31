# Protocol and capability preflight — WI-0056

Observed locally on 2026-08-31 before any model generation.

## Official lifecycle contract

The official [Codex App Server documentation](https://developers.openai.com/codex/app-server/) defines `initialize`, `thread/start`, `turn/start`, `model/list`, `thread/tokenUsage/updated`, and `turn/interrupt` as the relevant boundaries. Temple does not infer those wire values from its internal names.

## Installed contract validation

- Codex CLI: `0.151.0-alpha.7.2`
- `v2/ThreadStartParams.json` SHA-256: `792e2f32e37cece971bd616664ea2053741acbed4e9c92e9d1766427718f2ecd`
- `v2/TurnStartParams.json` SHA-256: `a3835e8c1e942e4b358e1a670939b89918b16c4d13105a579899892b7ade6dea`
- Exact `thread/start` payload: valid against the installed Draft-07 schema
- Exact `turn/start` payload: valid against the installed Draft-07 schema
- Thread wire policy: `approvalPolicy: "never"`, `sandbox: "read-only"`
- Turn wire policy: `approvalPolicy: "never"`, `sandboxPolicy: { "type": "readOnly", "networkAccess": false }`

The validator ignored only the schema's custom `uint` format annotation; no field or enum validation was skipped.

## Provider discovery

A no-generation `model/list` request returned seven models and reported `gpt-5.6-luna` with `low`, `medium`, `high`, `xhigh`, and `max` reasoning efforts. `max` is therefore supported by the current Provider discovery result.

## Generation state

No Provider thread, turn, prompt, or model-generation Token was created during this preflight. Account usage probing remained account-wide and unallocated.

