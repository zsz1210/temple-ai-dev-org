# Product specification — WI-0120

## Problem

`temple.execution-route/v1` is intended to be a trustworthy, versioned output contract. Its initial JSON Schema constrained top-level fields but left each step structurally open. A malformed or authority-expanding document could therefore pass generic JSON Schema validation even though the resolver itself would never produce it.

## Outcome

Any route document accepted as `temple.execution-route/v1` has the same bounded structure and authority claims as a resolver-produced route. Malformed types, unknown fields, invented lifecycle states, claimed effective execution, and inconsistent summaries fail closed with actionable validation errors.

## Required invariants

1. Every object rejects unknown properties.
2. Every identifier, enum, nullable field, array, and resource entry has an explicit schema.
3. Top-level authority is always non-executing.
4. Effective Provider, model, and reasoning remain `null` with status `unobserved` in v1.
5. A resolved step has a selected eligible profile and no unresolved reason; an unresolved step has no selected profile and carries a supported reason.
6. Selection authority corresponds to selection mode.
7. Summary counts match the actual steps.
8. Step IDs and per-step candidate/resource identifiers are unique where identity matters.
9. Unknown required and optional capability reports are subsets of their declared capability sets.
10. An unavailable observation has `null`, never numeric zero.

## Acceptance

The Work Item acceptance criteria are authoritative. Regression evidence must reproduce the original malformed-route shape and prove its rejection while preserving valid resolver output.
