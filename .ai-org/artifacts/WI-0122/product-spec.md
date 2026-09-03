# Product specification — WI-0122

An accepted `temple.execution-route/v1` document must remain a possible resolver result and must carry enough provenance to explain how a result was selected.

## Unresolved-reason precedence

Selection mode has precedence over capability classification:

- In `pinned` mode, an unresolved request uses `pinned-profile-not-found` when the requested profile does not exist and `pinned-profile-ineligible` when it exists but is ineligible. A non-empty `unknown_required` list still forces unresolved status, `fallback_applied: false`, and `selected: null`, but it does not replace the pinned-specific reason.
- In `advisory` or `shadow` mode, a non-empty `unknown_required` list forces `unknown-required-capability`, unresolved status, `fallback_applied: false`, and `selected: null`.
- A route may never report `unknown-required-capability` when `unknown_required` is empty.

## Additional invariants

- `resource_observations[].source` must contain non-whitespace text.
- Every resolved `advisory` or `shadow` result must have either a non-null matching `rule_id` or `fallback_applied: true`.
- Pinned routes never apply fallback.
- All WI-0120 and WI-0121 negative regressions and all declared positive compatibility routes remain valid according to their expected outcome.
