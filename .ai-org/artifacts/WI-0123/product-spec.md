# Product specification — WI-0123

For every policy, request, and resolver option set accepted by the public Execution resolver boundary, the returned `temple.execution-route/v1` document must pass the managed Route schema and `validateExecutionRoute`.

## Required behavior

- Required and optional Request capabilities use the same stable identifier grammar as Route capabilities.
- Invalid capability identifiers fail Request validation before resolution.
- An explicit `policySource` is one of `project`, `framework-default`, or `provided`.
- An explicit `generatedAt` is a canonical UTC ISO-8601 instant; invalid or non-canonical values fail before resolution.
- `validateExecutionRoute` is total for malformed resource-limit and resource-observation collections: it returns errors and does not throw.
- All WI-0120 through WI-0122 regressions and positive resolver outputs retain their expected behavior.
