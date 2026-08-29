# Vision and operating model

## Problem to solve

When multiple AI conversations each hold only local context, common outcomes include duplicate implementation, lost decisions, broken continuity, uncontrolled conversation growth, and titles replacing real work identifiers. Temple does not try to make every conversation remember everything. It enables every Position to recover work from the same external state.

## Organizational principles

1. A Position is a stable set of responsibilities and authority. An Agent Identity is a named executor in a project. An Assignment connects them.
2. One Agent may hold multiple Positions, so a small project does not need nine AI workers running at once.
3. Every Position exists from day one. Adding Agents later changes only Assignments, not workflow language or historical data.
4. Developer and Independent QA must use different Agent Identities so that one executor does not certify its own work.
5. Humans own business truth, priorities, cost, and high-risk approval. The Engineering Manager is the primary entry point.
6. Documents, Git state, test results, runtime evidence, and approval records are canonical state.

## The nine Positions

| Position | Primary responsibilities | Primary outputs | Cannot self-approve |
|---|---|---|---|
| Engineering Manager | Intake, decomposition, delegation, unblocking, overall status | Work order, handoff, status | Business priority, high-risk release |
| Product Manager | Problem, scope, acceptance criteria | Specification, acceptance criteria | Technical design, release |
| UX Designer | User flow, states, interaction risks | UX notes, flow, copy decisions | Implementation quality, release |
| Tech Lead | Architecture, interfaces, risk, technical decisions | Design, ADR, implementation plan | Product scope, independent QA |
| Developer | Implementation, unit tests, self-verification | Code, test evidence, handoff | Independent QA of their own work |
| Quality & Evaluation Engineer | Test design, evaluation, regression evidence | Test plan, evaluation report | Release |
| Independent QA | Independent reproduction, acceptance, counterexample search | QA report, pass or fail | Their own upstream implementation |
| Release Manager | Release gate, versioning, rollback readiness | Release record, go or no-go proposal | High-risk human approval |
| Observer | Observable views derived from canonical state | Status, timeline, stale alerts | Any product or release decision |

## Recommended initial configuration

A small project can cover nine Positions with five Agent Identities:

1. Coordination: Engineering Manager, Release Manager, Observer.
2. Product: Product Manager, UX Designer.
3. Technical: Tech Lead.
4. Delivery: Developer.
5. Quality: Quality & Evaluation Engineer, Independent QA.

These are Assignment slots, not Agent names. Names are created only during the project's first initialization.

## Work lifecycle

```text
Intake
  → Spec
  → Design
  → Build
  → Test
  → Eval
  → Independent QA
  → Release Gate
  → Done
```

Every handoff must include the work item ID, input revision, completed work, evidence location, unresolved issues, and next Position. Without these fields, chat content must not be treated as proof of completion.
