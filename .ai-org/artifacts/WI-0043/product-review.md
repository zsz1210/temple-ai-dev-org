# Team information architecture review

- Work Item: `WI-0043`
- Position: Product Manager
- Agent Identity: `agent-yuna`
- Review status: approved for a separate implementation Work Item
- Review date: 2026-08-31

## Outcome

Temple Workspace should keep the human-facing destination name **Team** while treating its source data as the Organization projection. Team explains durable responsibility, eligibility, accountability, and authority. Work continues to explain current execution. The two destinations must not become competing views of the same state.

The existing single **Human Principal** apex is acceptable as a Solo illustration but becomes misleading in Collaborative and High-Assurance profiles because it reads as a reporting hierarchy or a unique executive. Remove that apex from the responsibility view rather than adding more people above the Position lanes.

## Approved information architecture

Team uses three views with the same structure in every profile:

1. **Responsibilities** is the default. It retains the Product & Experience, Engineering Delivery, and Assurance & Release lanes. Each Position shows its default Agent, eligible pool, covered Disciplines, qualification attention, and a bounded link to active work. An unknown future Position remains visible under Additional responsibilities.
2. **People & Agents** distinguishes accountable Human Principals from sponsored Agent Identities. Duplicate display names are allowed. Ambiguity is resolved with an immutable Principal ID or provider handle, never an email address.
3. **Authority** presents explicit Human Authority Grants, scope, risk ceiling, approval count, expiry, bootstrap-owner state, and governance readiness. Company title never implies Temple authority.

Position, Discipline, Position Membership, default Assignment, Work claim, Agent sponsorship, and Human Authority Grant remain separate concepts. A Position may have many eligible Agents while retaining one default Assignment. `all_positions_must_be_assigned` therefore does not require one human employee per Position.

## Profile behavior

- **Solo:** one accountable person may operate several Agent Identities. Authority detail is progressively disclosed.
- **Collaborative:** provider-verified identity binding, sponsorship, Position pools, qualifications, and scoped grants become visible.
- **High-Assurance:** the same views add risk tier, separation-of-duty, approval quorum, step-up verification, rollback, and recovery readiness.

Profile changes governance intensity, not Team page structure or headcount assumptions.

## Truth and privacy boundaries

- Team is a read-only diagnostic projection in the first implementation. Canonical changes continue through audited repository and CLI workflows.
- Configured never means online. Selection and highlighting never imply runtime activity.
- Work owns claims, branches, tasks, candidate revisions, integration joins, and blocked execution. Team may show only a bounded active-work count and link.
- The private viewer may show redacted responsibility coverage and governance readiness. It must not expose Human Principal records, sponsorships, local identity bindings, credentials, detailed grants, prompts, or command payloads.
- Temple records responsibility-changing decisions and evidence. It does not collect keystrokes, raw prompts, time tracking, productivity scores, or inferred employee performance.

## Interaction and accessibility

- Tabs and filters are frequent actions and should be immediate.
- An occasional anchored detail panel may use a short 180–220 ms ease-out transition; reduced-motion mode removes spatial movement.
- Essential information is readable without hover, keyboard reachable, and never encoded by color alone.
- Wide screens use three responsibility lanes; compact and mobile layouts stack without horizontal overflow.

## Validation program

Validation is capability-based rather than based on an example team size:

1. **V0 automated:** schema, CLI, policy, migration, rendering, and failure-path tests. This is not real multi-human evidence.
2. **V1 real Collaborative:** at least two distinct Human Principals in two independently administered environments, two competing eligible Agents, and a different Independent QA Agent.
3. **V2 representative team pilot:** a real feature crosses shared contracts, several pull requests, integration, OSS intake or onboarding, personnel flow, and the full lifecycle.
4. **V3 High-Assurance drill:** risk-scaled distinct approvals, separation, rollback, step-up verification, and configured governance recovery.

Temple may simulate separate clones and identities on one machine, but the result must be labelled `simulated_passed` with `real_environment_not_run`. One person on two machines is multi-machine evidence, not multi-human evidence.

The current repository coordination backend does not provide a distributed atomic lock. Collaborative Alpha therefore promises visible conflict, no silent canonical-record loss, and safe recovery. It does not promise cross-machine claim prevention. A remote coordination backend remains deferred until representative field evidence justifies it.

## Rejected alternatives

- A permanent single Human Principal apex in every profile.
- One dense chart that mixes organization, live execution, and governance administration.
- A fixed four-person or any other example-sized team model.
- Email addresses as durable identity keys.
- Silent last-write-wins claims across machines.
- Treating a local multi-clone simulation as real multi-human validation.
- Exposing Principal and authority details through the private viewer.

## Implementation boundary

This review authorizes a separate implementation Work Item. `WI-0043` itself changes no Dashboard code, remote command surface, release state, publication, or external system.
