# WI-0104 product specification

## User outcome

A maintainer can run one command after supplying an available Docker-compatible runtime and receive a truthful, disposable multi-repository result. The result must show whether a versioned service change fails, rolls back, and succeeds in consumer-first order without reading the conversation that designed the fixture.

## Service behavior

### Catalog

- Owns stock availability.
- Returns v1 `{ sku, available }` or v2 `{ sku, status, contract_version: "v2" }` according to startup configuration.
- Returns an explicit unknown-SKU result.

### Orders

- Owns order state and deterministic order identity.
- Validates a non-empty SKU and positive integer quantity.
- Initially accepts only Catalog v1.
- In compatible mode accepts and normalizes both Catalog v1 and v2.
- Emits one deterministic `OrderPlaced` v1 event after successful checkout.
- Emits nothing when checkout fails.

### Notifications

- Accepts only a valid `OrderPlaced` v1 event.
- Records deterministic delivery state.
- Treats a duplicate event ID idempotently.
- Rejects malformed or unsupported events without creating or changing delivery state.

## Scenario acceptance

| Scenario | Required observation |
| --- | --- |
| Baseline | v1 checkout succeeds and one notification is retained |
| Producer-first failure | Catalog v2 plus v1-only Orders fails as an explicit contract mismatch and creates no new notification |
| Rollback | Returning Catalog to v1 restores a successful checkout |
| Consumer-first preparation | Compatible Orders continues to accept Catalog v1 |
| Producer switch | Compatible Orders accepts Catalog v2 and checkout succeeds |
| Malformed event recovery | Notifications rejects bad input without state mutation, then accepts a valid event |
| Cold aggregate inspection | The retained report identifies all repository IDs, exact commits, scenario outcomes, and cleanup state without prior-chat input |

## Evidence requirements

- Run each repository's native test suite before container build.
- Record the base image digest and built image sizes.
- Record Compose configuration validation, health, logs on failure, and scenario exit codes.
- Preserve elapsed time and disk observations as measured values; unavailable fields stay unknown.
- Keep Developer and Independent QA Agent Identities distinct on WI-0104.

## Exclusions

No database, queue, authentication, encryption-at-rest claim, load test, fault-tolerant cluster, Kubernetes, cloud deployment, production observability, public endpoint, real customer data, model task, or financial saving claim is part of this slice.
