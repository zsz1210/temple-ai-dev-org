# Work order — WI-0122

Repair the three remaining Execution Route contract gaps found by WI-0121 Independent QA without broadening execution authority or changing project-owned routing policy.

## Required outcome

- Define deterministic reason precedence for the intersection of pinned selection and unknown required capabilities.
- Accept every actual resolver output while continuing to fail closed.
- Reject whitespace-only resource-observation sources.
- Reject resolved non-pinned selection that has neither rule provenance nor an explicit fallback.
- Retain every prior negative and positive regression case.

## Boundary

This is a local schema, semantic-validation, and regression-test repair. It does not contact a Provider, execute a model, change model policy, enable automatic routing, or authorize push, merge, deployment, publication, or release.
