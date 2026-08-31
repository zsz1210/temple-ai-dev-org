# WI-0067 technical design

## Waves

| Wave | Concurrent model turns | Dependency |
|---|---|---|
| 1 | Catalog Tech Lead; Orders Product Manager | protocol and repository baseline |
| 2 | Catalog Developer; Orders v1 Developer | approved contract and checkout scope |
| 3 | Orders dual-version Developer | Catalog v1 and Orders v1 |
| 4 | Orders event Developer | stable order state |
| 5 | Notifications Developer | approved `OrderPlaced` contract |
| 6 | Orders Independent QA; Notifications Independent QA | integrated candidates and failure recovery |
| 7 | Coordinator Independent QA | every participant exact revision and repository evidence |

No wave contains two simultaneous turns for one repository.

## Provider adapter

The adapter pins installed Codex CLI and generated App Server schemas before generation. Each turn:

1. starts a repository-local telemetry journal and Provider;
2. registers the exact Work Item, Position, launch revision, Luna request, and Max request before `turn/start`;
3. forwards cumulative Provider usage to the WI-0066 runner;
4. honors Token or timeout interrupts through the registered active turn;
5. never retries or falls back;
6. records only bounded task, model, reasoning-provenance, usage, terminal, and error metadata;
7. marks the canonical task completed only after a completed terminal event and a clean committed repository candidate.

The installed protocol may report thread-level reasoning separately and may leave effective-turn reasoning unavailable. That is accepted when request and observation provenance remain explicit.

## Service contracts

- Availability v1: `{ sku, available: boolean }`.
- Availability v2: `{ sku, status: "in_stock" | "out_of_stock", contract_version: "v2" }`.
- Orders accepts v1 and v2 after its consumer-first change and normalizes both to one internal availability decision.
- `OrderPlaced` v1 contains event ID, order ID, SKU, quantity, and occurred-at timestamp.
- Notifications is idempotent by event ID and rejects malformed or unsupported events without creating delivery state.

## Failure injections

The run records expected rejection or recovery for wrong or stale composite references, incompatible rollout order, missing or dirty participant state, project identity mismatch, escaped participant path, affected-path overlap and competing claims, producer-first v2 failure then v1 rollback, malformed event recovery, uncorrelated or model-drift usage fixture, Developer/IQA identity collision, and repository-only cold recovery.

Synthetic failures run in disposable copies or through explicit runtime switches. Canonical participant state is never silently repaired.

## Qualification

Every measured Work Item must be done, have one completed registered task, correlate detailed usage to the launch revision and Position, and resolve to one task/model/shape identity. The coordinator aggregates composite IDs only after local qualification.

