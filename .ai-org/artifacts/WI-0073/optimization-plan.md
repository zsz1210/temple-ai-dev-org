# WI-0073 fixture-consolidation plan

## Trigger

Hosted CI run `33410153285` passed repository checks, schema validation, and the repaired Doctor. Its full suite then exposed two pre-existing hosted-runner races and remained alive after the failures until the run was cancelled. Local full verification had passed all 252 tests in 54.6 seconds. This Work Item removes repeated evidence fixtures as a bounded cost reduction; the independently scoped race repairs are required before hosted completion can be accepted.

## Approved change

Keep all WI-0072 behaviors while removing two complete Temple fixture initializations:

1. Fold affected-scope dirty-path rejection into the existing exact-Git-evidence fixture.
2. Fold unrecorded-revision and conflicting-tag rejection into the existing durability/fresh-clone fixture after its passing Doctor assertions.
3. Retain the same assertions and leave production code, CI timeout, workflow topology, and evidence tags unchanged.

## Acceptance and risk

- Focused evidence tests must retain every previous positive and negative assertion.
- Local `npm run verify` must pass.
- Hosted CI must pass under the existing 10-minute timeout; do not increase the limit to conceal fixture overhead.
- This is test-structure optimization only. It must not reduce Doctor coverage, skip full behavior for source changes, or modify evidence authority.
