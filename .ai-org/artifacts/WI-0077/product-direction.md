# Product direction — WI-0077

## Product promise

Temple Workspace helps a human understand what the AI development organization is doing, who or what is responsible, what needs a decision, how much evidence exists, and whether the organization is operating safely.

It does not replace the canonical repository. It turns canonical state into an understandable operating surface.

## Primary users

The same information architecture serves different scales through progressive disclosure and saved filters:

- **Solo developer** — coordinates several AI Agents, identifies the next decision, and investigates usage without maintaining a mental map of every thread.
- **Collaborative team lead or Product Manager** — sees ownership, handoffs, dependencies, and decisions across humans and Agents.
- **Developer, Designer, QA, or Release owner** — filters to work relevant to a Position, Discipline, component, or gate.
- **Enterprise observer** — inspects authority, assurance, system conditions, and historical evidence without gaining mutation permission.

These are views over one organizational model, not separate Temple products.

## Operating questions

Every primary destination owns one human question:

| Destination | Human question | First-layer content |
| --- | --- | --- |
| Overview | What needs my attention now? | Decisions, true blockers, work moving, upcoming gates, follow-up |
| Work | What is being delivered, and where is it in the lifecycle? | Filterable Work inventory and selected-item detail |
| Team | Who or what is responsible, and with what authority? | Positions, People & Agents, Assignments, authority, current work/model evidence |
| Usage | What resources are being consumed, and how trustworthy is the interpretation? | Tokens, model use, coverage, cost availability, trends when qualified |
| System | Is the Console and its evidence pipeline trustworthy right now? | Providers, freshness, transport/access, current conditions |
| History | What happened, and can I retrieve the evidence? | Finished work, audit trail, evidence search |

Local-only **Action Center** tools are not primary observational navigation. Human Inbox and Agent Commands appear only on loopback when policy and capability allow them.

## Overview hierarchy

1. **Needs you now** — a human decision, a dependency-blocking impediment, a current failed provider, or a gate awaiting the current user.
2. **Work moving** — running claims, current build/test work, specification/design work, and release candidates.
3. **Upcoming gates** — the next evidence or approval boundary, with owner and consequence.
4. **Follow-up** — intentionally retained validations, stale non-blocking evidence, and maintenance.

If the first section is empty, it should say so plainly. Temple must not manufacture urgency to fill the screen.

## Work model

The Work page combines lifecycle, execution, and impediment without conflating them:

- **Lifecycle**: Intake, Spec, Design, Build, Test, Eval, Independent QA, Release Gate, Done.
- **Execution**: Unclaimed, Claimed, Worker running, Waiting, Finished.
- **Impediment**: Clear, At risk, Blocked.

The list exposes the minimum comparable fields: ID, title, lifecycle, execution, impediment, responsible Position, Agent/Human owner, updated time, and model evidence when present. Selecting an item reveals dependencies, affected paths, Codex task, authority, verification, usage, and the responsibility chain.

## Trust rules

- Never infer missing cost, Token, model, provider, or task evidence.
- Show evidence freshness and access mode before offering operational conclusions.
- A red global alert requires a current system-level consequence.
- A blocked Work Item is not automatically a global blocker.
- Historical evidence is not a current incident.
- Private-network viewers remain read-only even when they can see the same operational state.
- UI summaries remain projections; canonical repository records retain lifecycle authority.

## Acceptance criteria for the design

- A user can identify the next human action without opening a raw JSON or Markdown record.
- Open work never appears as zero merely because no Worker or claim is active.
- A user can distinguish lifecycle, execution, and impediment for one Work Item.
- A user can locate Agent, Position, human authority, and effective model without remembering display names.
- Usage states measurement coverage before making recommendations.
- A user can distinguish a current incident from historical or retained evidence.
- The layout remains usable at 2560, 1440, 1024, and 390 CSS-pixel widths.
- The private viewer does not expose local action controls or claim write authority.
