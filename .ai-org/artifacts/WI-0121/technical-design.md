# Technical design — WI-0121

## Schema constraints

Add a reusable non-blank string definition. Capability arrays use identifier items; free-form meaningful strings use the non-blank definition. Requested execution mapping uses `oneOf` to require either three `null` fields or three non-blank strings.

Selection retains its field schema while semantic validation owns cross-field mode/reason/fallback consistency. JSON Schema continues to enforce the safety-critical enumerations and non-executing effective state.

## Semantic constraints

Extend `validateExecutionRoute` to reject:

- blank Work Item and Task Shape strings;
- blank capability and rejection-reason values;
- partial requested mappings;
- required/optional overlap;
- a resolved route with unknown required capabilities;
- unknown-required reason when the unknown list is empty;
- pinned fallback or non-pinned use of pinned-only reasons; and
- pinned unresolved reasons that are not pinned-specific.

Retain total behavior for malformed direct inputs, even though catalog validation invokes semantics only after JSON Schema succeeds.

## Verification

Convert the nine independently discovered bypasses into table-driven cases. For each case, assert that at least the responsible validation layer rejects it and that the complete schema-plus-semantic pipeline fails. Keep positive fixtures for mapped, Provider-neutral, pinned-unresolved, shadow, and custom media routes.
