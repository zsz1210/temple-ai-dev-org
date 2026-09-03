# Technical design — WI-0123

## Request boundary

Add reusable identifier definitions to both managed Execution Request schema copies and use them for required and optional capability arrays. Mirror that rule in `validateExecutionRequest`.

## Resolver options

Validate options synchronously at `resolveExecutionRequest` entry. Accept only the three schema-declared policy-source values. Accept generated timestamps only when they are strings equal to `new Date(value).toISOString()`, which guarantees the emitted canonical UTC form.

## Total Route validation

Normalize malformed resource collections to empty arrays only for safe iteration while separately recording an array-type error. Never call `.entries()` on an unverified value.

## Verification

Add required/optional invalid capability cases, malformed collection cases, and invalid option cases. Retain all earlier positive fixtures and adversarial mutations, then run focused, full, schema, Doctor, and separate Independent QA checks on one exact candidate revision.
