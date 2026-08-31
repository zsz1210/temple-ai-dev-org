# WI-0067 approved scope

## Scenario

The synthetic commerce system has three service authorities and one coordinator:

- Catalog owns availability and its versioned API.
- Orders owns checkout, order state, and the `OrderPlaced` event.
- Notifications owns event consumption and delivery state.
- Coordinator owns the experiment protocol, composite references, rollout waves, failure matrix, and derived read-only report.

The contract rollout is consumer-first. Orders must support availability v1 and v2 before Catalog may switch the producer mode to v2.

## Work and model allocation

Fifteen Work Items are distributed across the four repositories. Ten receive exactly one Provider-owned Luna Max turn:

1. Catalog availability contract design — Tech Lead.
2. Orders checkout product specification — Product Manager.
3. Catalog deterministic provider — Developer.
4. Orders v1 adapter and order state — Developer.
5. Orders dual v1/v2 consumer — Developer.
6. Orders `OrderPlaced` contract and producer — Developer.
7. Notifications deterministic consumer — Developer.
8. Orders exact-candidate Independent QA — Independent QA.
9. Notifications exact-candidate Independent QA — Independent QA.
10. Coordinator repository-only cold recovery and evaluation — Independent QA.

Five mechanical Work Items cover protocol and budget, federation and waves, failure injection and portfolio, producer-first failure/rollback, and malformed-event recovery.

## Required evidence

- exact participant revisions before and after each turn;
- clean-start and changed-path allowlist results;
- Provider task, turn, model, requested reasoning, and detailed Token correlation;
- service and integration test results;
- expected failure and recovery observations;
- distinct Developer and Independent QA identities;
- ten locally qualified completed Work Items across at least two task shapes;
- final report with missing values, overhead, exclusions, and limitations.

## Invalid conclusions

This rehearsal cannot prove causal savings, monetary cost, model superiority, automatic routing, enterprise readiness, production readiness, or release approval.

