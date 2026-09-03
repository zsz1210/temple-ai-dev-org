# Product specification — WI-0124

- Explicit `generatedAt` accepts only a four-digit year and the canonical `YYYY-MM-DDTHH:mm:ss.sssZ` form that round-trips through JavaScript Date and passes the managed Route date-time format.
- Expanded-year, offset, abbreviated, invalid, null, and non-string timestamps fail before Route generation.
- Semantic Request validation rejects unknown properties at the document, step, Task Shape, capability route, constraints, selection, resource-limit, and resource-observation boundaries.
- Resolver output explicitly copies only declared Task Shape, resource-limit, and resource-observation fields.
- Every input accepted by policy, Request, and option validation produces a Route accepted by managed schema and semantic Route validation.
- All earlier positive and negative regressions remain valid.
