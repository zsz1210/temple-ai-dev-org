# Technical design — WI-0120

## JSON Schema boundary

Replace the open step item in both managed Execution Route schema copies with complete draft 2020-12 definitions for identifiers, string sets, Task Shape, Capability Route, selection, selected profile, eligibility, resource limits, and resource observations.

Use conditional schemas for resolved versus unresolved selection and observed versus unavailable resource values. Fix authority flags and v1 effective-execution fields with `const`. Reject all undeclared fields through `additionalProperties: false` at every object level.

## Semantic boundary

Export `validateExecutionRoute(document)` from `src/execution-routing.mjs`. It is a pure validator and checks invariants not conveniently expressible in JSON Schema:

- summary totals equal the route step array;
- step IDs are unique;
- selection authority matches its mode;
- resolved/selected/eligible and unresolved/reason states agree;
- eligible and rejected profile IDs are unique and disjoint;
- unknown capability arrays are subsets of their declared arrays; and
- resource measure IDs are unique within limits and observations.

`src/schema-validation.mjs` applies this semantic validator to catalog entry `execution-routes` after JSON Schema succeeds. It performs no write and has no Provider dependency.

## Regression design

Tests compile the actual managed schema with Ajv 2020 and validate real resolver output. A mutated copy reproduces the independent QA payload: numeric identifier, invalid executed status, claimed effective values, unavailable zero, and unexpected command. Each mutation must fail.

A temporary repository route file under the cataloged generated path proves `temple schema validate` also applies semantic consistency checks, including an incorrect summary that is otherwise structurally valid.

## Compatibility

The valid resolver output shape does not change. There is no policy migration and no project-owned file rewrite. Updating the managed schema changes its lock digest through the normal self-host lock update. Install and upgrade preservation tests continue to own lifecycle compatibility.
