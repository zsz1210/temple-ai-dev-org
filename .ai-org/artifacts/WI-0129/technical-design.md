# WI-0129 technical design

## Documentation boundaries

- Roadmap: product purpose, capabilities, milestone status, and direction only.
- Core Path: the shortest Console-free end-to-end operating journey.
- Usage guide: complete reference and alternative operations.
- Validation: exact experiments, results, limitations, and future protocols.
- Work Items and Release readiness: detailed implementation and distribution state.

The Core Path uses the repository-pinned `node ./templew.mjs` launcher and derives its Lean transitions from executable workflow tests. The Usage guide links to it and keeps only the missing bridge material needed to repair the audited P1 findings.

## Evaluation design

Use three matched arms so two effects remain identifiable: conventional workflow with a fixed route, Temple with the same fixed route, and Temple with Adaptive Execution Routing. Compare the first two for framework effect and the last two for routing effect. Correctness and blind evaluation are eligibility gates before Token, latency, or overhead claims.

## Verification

Run repository checks, focused lifecycle/routing/link tests, the full verification suite, and separate exact-candidate Independent QA. Retain any protocol or documentation contradiction instead of weakening the claim.
