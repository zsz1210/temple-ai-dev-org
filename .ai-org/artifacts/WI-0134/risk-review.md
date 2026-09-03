# Risk review - WI-0134

## Risks and controls

- **Hiding valid evidence drift:** only explicitly invalidated records skip artifact checks; active records remain fail-closed.
- **Erasing history:** records are updated in place with invalidation metadata and retained in the registry and Observer projection; deletion is not supported.
- **Invalid replacement:** replacement IDs must be different, current, and owned by the same Work Item.
- **Partial mutation:** registry changes roll back when audit-event append fails.
- **Gate bypass:** existing gate resolution already rejects evidence with `invalidated_at`.
- **Overlapping legacy work:** WI-0134 is sequential and temporarily owns `test/evidence-observer.test.mjs`; blocked WI-0086 remains unchanged.

## Residual risk

Invalidation is an administrative truth claim. The audit record preserves who invalidated the evidence and why; it does not independently prove the reason. Human approval is not required here because the two targets are unused, no external action occurs, and later valid evidence already exists.
