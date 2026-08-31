# Decision Ledger

## Decision

- ID: DEC-0003
- Status: accepted
- Date: 2026-08-31
- Owner position: Product Manager and Tech Lead
- Work item: WI-0070

## Context

Temple can preserve Lessons and Practices and retrieve them later, but it does not currently manage the promotion frontier. Without a promotion review mechanism, a human must notice repeated learning, decide whether it should become a Skill, and manually start authoring. Silent automatic activation would remove that burden but would also let an Agent change recurring repository behavior without a human decision.

The user confirmed that Temple should manage discovery and proposal preparation while retaining a lightweight human activation boundary.

## Options considered

1. Keep promotion fully manual. This preserves authority but leaves the human responsible for finding and managing candidates.
2. Automatically activate low-risk project-local Skills. This minimizes prompts but depends on an unproven risk classifier and can silently change recurring Agent behavior.
3. Automatically detect repeated Practices and prepare evidence-backed Skill Proposals, then require one explicit human approval before authoring begins.

## Decision and rationale

Adopt option 3.

Temple will automatically surface reviewable candidates from validated project learning and let the Tech Lead create a bounded Skill Proposal. The proposal must state its trigger, neighboring non-trigger, authority, dependencies, risk, evidence, alternatives, and overlap review. A human may approve, reject, or defer it.

Approval creates one project-owned Skill-authoring Work Item. It does not create a `SKILL.md`, install dependencies, activate a capability, publish a pack, or promote anything into Temple core. Actual authoring remains governed by `$skill-authoring`, repository verification, and the normal QA lifecycle. Rejection and deferral remain auditable and do not silently disappear.

Risk changes the validation and approval depth, not the need for authorization. Silent low-risk activation is deferred until representative proposal, routing, authority-boundary, and rollback evidence exists.

## Consequences and follow-up

- Files or work items affected: `WI-0070`, the Learning CLI and schema, Observer and Management Console projections, and engineering-learning documentation.
- Open questions: whether a later opt-in standing authorization can safely activate narrowly defined low-risk project Skills without per-proposal approval.
- Revisit trigger: at least ten real Skill Proposals, high acceptance without material rewrite, zero authority-boundary violations, verified rollback, and representative routing evaluation across more than one project.

