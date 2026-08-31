# Product specification: Provider protocol compatibility gate

## User outcome

A maintainer can trust that Temple will either send a Provider-owned launch request matching the inspected App Server contract or reject it locally before opening a Provider thread.

## Compatibility contract

| Temple internal policy | `thread/start` wire value | `turn/start` wire value |
|---|---|---|
| sandbox `readOnly` | `read-only` | `{ "type": "readOnly" }` with network disabled |
| sandbox `workspaceWrite` | `workspace-write` | `{ "type": "workspaceWrite", ... }` with explicit writable root and network policy |
| approval `never` | `never` | `never` |
| approval `onRequest` | `on-request` | `on-request` |
| approval `unlessTrusted` | `untrusted` | `untrusted` |
| approval `onFailure` | unsupported; reject locally | no request |

Raw wire values are not accepted as substitutes for Temple's internal caller vocabulary. This keeps the translation boundary explicit and makes protocol drift observable.

## Error contract

A Provider rejection exposes:

- a stable Temple reason code;
- the integer JSON-RPC code when one was received;
- a bounded category such as `invalid-request`, `method-unsupported`, `provider-rejected`, or `transport-unavailable`;
- `automaticRetry: false` and `instructionRetained: false`.

It does not expose or durably retain the Provider message, raw response, prompt, hidden reasoning, credential, or tool payload.

## Acceptance interpretation

Passing this Work Item proves local protocol translation and regression protection only. It does not prove that a real Provider thread can start, a model can complete, Desktop can display the thread, or detailed Token usage will arrive.
