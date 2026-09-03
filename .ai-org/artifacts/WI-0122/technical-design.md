# Technical design — WI-0122

## Contract repair

1. Change the step-level unknown-required schema conditional so it always enforces unresolved, non-fallback, and null selection, while the exact reason branches by selection mode.
2. Mirror that precedence in `validateExecutionRoute` rather than changing resolver behavior.
3. Reuse the schema `nonBlank` definition for resource-observation source and validate it semantically.
4. For resolved non-pinned routes, require `rule_id !== null` or `fallback_applied === true` in both schema and semantic layers.

## Regression strategy

- Generate real pinned routes with an existing and a missing pinned profile plus an unknown required capability; both must pass schema and semantic validation while retaining pinned-specific reasons.
- Add malformed source and impossible resolved-provenance counterexamples.
- Preserve all prior adversarial cases and positive mapped, neutral, pinned-unresolved, advisory, shadow, and media-extension fixtures.

## Compatibility

No schema version change is required because the patch reconciles validators with outputs the v1 resolver already emits and narrows only states the resolver cannot emit.
