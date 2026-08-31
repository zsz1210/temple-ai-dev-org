# Technical design: explicit App Server wire translation

## Design

Keep caller validation and wire encoding separate:

1. `providerOwnedLaunchRequest` validates the stable Temple-internal vocabulary.
2. A pure translation boundary converts the validated approval and sandbox policies into exact wire values.
3. `thread/start` receives kebab-case enum values from that boundary.
4. `turn/start` receives the current string approval value and the current tagged sandbox-policy object.
5. Unsupported internal values fail before `connection.request`.

The test suite records the inspected external contract independently from the mapping implementation, including the CLI version and schema digests. Provider fake servers then reject any request outside that captured contract. Tests also assert that unsupported `onFailure` creates no `thread/start` call.

## Rejection classification

Classify only protocol-safe metadata:

| Condition | Category |
|---|---|
| RPC `-32600` or `-32602` | `invalid-request` |
| RPC `-32601` | `method-unsupported` |
| another integer RPC code | `provider-rejected` |
| no integer RPC code | `transport-unavailable` |

The existing JSON-RPC connection may hold a bounded Provider message ephemerally for attach classification, but Provider-owned launch results and errors must not copy it into returned or durable state.

## Verification

- focused Provider-owned launch tests;
- assertion that the fake Provider validates the captured thread-start enums;
- assertion of both sandbox mappings and all supported approval mappings;
- assertion that `onFailure` fails before Provider contact;
- assertion that thread and turn rejection expose only bounded classifications and never the secret fixture message;
- full `npm run verify`;
- fresh detached-worktree Independent QA at the exact candidate.

## Rollback

Revert the implementation candidate while retaining WI-0054 and WI-0055 evidence. Do not retry or delete a Provider thread automatically.
