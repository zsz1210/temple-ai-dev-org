# Product specification — WI-0121

An accepted `temple.execution-route/v1` document must be a possible resolver result, not merely an object whose fields have individually valid types.

The validator must enforce:

1. requested Provider, model, and reasoning are either all non-blank strings or all `null`;
2. every contract string that carries identity or meaning is non-blank;
3. required and optional capability sets are disjoint;
4. any unknown required capability forces an unresolved result with `unknown-required-capability`;
5. `pinned` never applies fallback and may use only pinned-specific unresolved reasons;
6. `advisory` and `shadow` may use only capability/no-eligible-profile unresolved reasons; and
7. valid provider-neutral, mapped, pinned-unresolved, advisory, shadow, and media-extension outputs remain accepted.

The exact nine prior bypasses are mandatory regression inputs.
