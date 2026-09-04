# OrderPlaced v2 rolling-compatibility change

Update the four local services so a checkout publishes and exposes `OrderPlaced` version 2 without breaking retained version 1 events during a rolling deployment.

## Required behavior

- Catalog returns `inventoryRevision` for a known SKU.
- Orders emits this exact version 2 shape:

```json
{
  "type": "OrderPlaced",
  "version": "v2",
  "id": "event-request-1",
  "occurredAt": "2026-09-03T00:00:00.000Z",
  "locale": "ja-JP",
  "inventoryRevision": "inventory-7",
  "order": {
    "id": "order-request-1",
    "sku": "SKU-1",
    "quantity": 2
  }
}
```

- Notifications accepts both the retained v1 flat event and the new v2 nested event, rejects unsupported or malformed events, and keeps delivery idempotent by event ID.
- Gateway keeps the stable `orderId` and `status` response fields and adds `eventVersion`.
- The end-to-end checkout must propagate the Catalog inventory revision into the published event.

## Engineering boundary

Use only the local repositories and their recorded responsibility artifacts. Do not access the network, install packages, deploy, publish, change external state, or ask the user to reconstruct prior conversation. Run the tests available to your assigned slice and record exact revisions and unresolved issues for the next owner.
