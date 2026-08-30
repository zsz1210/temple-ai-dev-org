# Temple documentation

The root README explains what Temple is and why it exists. This index routes implementation, adoption, and evidence questions to one authoritative document without making the public entry point carry the framework's history.

## Start with your goal

| I want to… | Start here | Continue with |
|---|---|---|
| Evaluate the framework | [Vision and operating model](concepts/vision.md) | [Architecture](concepts/architecture.md), [Roadmap](planning/roadmap.md) |
| Install or adopt Temple | [Usage guide](getting-started/usage.md) | [Enterprise document adoption](getting-started/enterprise-document-adoption.md), [Testing strategy](getting-started/testing.md) |
| Coordinate people and AI agents | [Collaborative development](operations/collaboration.md) | [Parallel orchestration](operations/parallel-orchestration.md), [Runtime coordination](operations/runtime-coordination.md) |
| Define product, UX, UI, or API behavior | [Product specifications](concepts/product-specifications.md) | [UI design modes](concepts/ui-design.md), [UI interaction contracts](concepts/ui-interaction-contracts.md) |
| Add engineering methods or project Skills | [Capability catalog](extensions/capability-catalog.md) | [Skill authoring](extensions/skill-authoring.md), [Engineering Learning Loop](extensions/engineering-learning.md) |
| Inspect evidence, risk, or live project state | [Evidence and Observer](operations/evidence-and-observer.md) | [Local control plane](operations/control-plane.md), [High-Assurance](operations/high-assurance.md) |
| Audit a decision or claim | [ADR index](adr/README.md) | [Validation index](validation/README.md), [Research index](research/README.md) |

## Documentation map

### Getting started

- [Usage guide](getting-started/usage.md) — initialize, adopt, operate, self-host, upgrade, and troubleshoot.
- [Enterprise document adoption](getting-started/enterprise-document-adoption.md) — preserve, bridge, or intentionally migrate an existing documentation system.
- [Testing strategy](getting-started/testing.md) — fast local checks, full behavioral verification, release checks, and explicitly authorized live tests.

### Concepts

- [Vision and operating model](concepts/vision.md) — Positions, Agent Identities, Skills, human authority, and lifecycle.
- [Architecture](concepts/architecture.md) — canonical state, ownership, mutation safety, generated views, and extension boundaries.
- [Product specification system](concepts/product-specifications.md) — product truth, revisions, Feature Specs, and external authority.
- [UI design modes](concepts/ui-design.md) — proportionate design evidence without requiring a particular vendor.
- [UI interaction contracts](concepts/ui-interaction-contracts.md) — connect behavior, screens, implementation, APIs, and backend rules.

### Operations

- [Collaborative development](operations/collaboration.md) — Human Principals, specialists, Position pools, claims, and multi-maintainer boundaries.
- [Parallel orchestration](operations/parallel-orchestration.md) — safe waves, affected paths, preparation, and integration joins.
- [Runtime coordination](operations/runtime-coordination.md) — pinned launcher, workers, resources, task correlation, and recovery.
- [Task and tracker coordination](operations/task-and-tracker-coordination.md) — company tracker, Temple Work Item, and Codex task boundaries.
- [Evidence and Observer](operations/evidence-and-observer.md) — normalized evidence, exact revisions, stale signals, and closeout.
- [High-Assurance profile](operations/high-assurance.md) — risk-scaled evidence, separation of duties, rollback, and human approvals.
- [Local control plane](operations/control-plane.md) — replay-safe events, providers, live projections, and the Human Inbox.

### Extensions and learning

- [Capability catalog](extensions/capability-catalog.md) — core, optional, candidate, and project-owned engineering capabilities.
- [Context routing](extensions/context-routing.md) — bounded retrieval and the optional semantic-search boundary.
- [Engineering Learning Loop](extensions/engineering-learning.md) — Lessons, Practices, revalidation, and evidence-based promotion.
- [Skill authoring](extensions/skill-authoring.md) — create a bounded, discoverable, and verifiable project Skill.
- [Skill design policy](extensions/skill-design.md) and [scenario matrix](extensions/skill-scenarios.md) — maintainer rules and routing expectations.
- [Extension and migration contracts](extensions/extension-and-migrations.md) — Packs, provenance, compatibility, schemas, and explicit state migration.
- [Archify adapter](extensions/archify-adapter.md) — an optional, pinned, isolated adapter boundary.

### Planning and historical boundaries

- [Roadmap](planning/roadmap.md) ([Japanese](planning/roadmap.ja.md), [Traditional Chinese](planning/roadmap.zh-TW.md)) — delivered foundation, current work, next gates, and later options.
- [Pre-Phase 4 closeout review](planning/pre-phase-4-closeout-review.md) — the readiness audit that closed the earlier phases.
- [Phase 1 contract](planning/phase-1.md) — original foundation scope and exit gate.
- [Phase 3 design](planning/phase-3-control-plane.md) and [work breakdown](planning/phase-3-work-items.md) — accepted control-plane plan.
- [Changelog](../CHANGELOG.md) — chronological release history.
- [Architecture Decision Records](adr/README.md) — accepted rationale and consequences.
- [Validation records](validation/README.md) — revision-bound evidence and retained gaps.
- [Research](research/README.md) and [official sources](research/official-sources.md) — decision inputs, not shipped promises.
- [Pilot records](pilots/README.md) — bounded experiments with explicit stop conditions.

## What each document type means

| Type | Question it answers | Authority |
|---|---|---|
| README | What is this, why should I care, and how do I begin? | Human-facing entry point |
| Guide | How do I use a current capability? | Current operating guidance grounded in code and tests |
| ADR | Why did Temple choose this design? | Accepted decision until superseded |
| Validation record | What was tested, where, and with what limits? | Bounded evidence for one revision and environment |
| Roadmap | What is delivered, current, next, or intentionally later? | Direction, not release history |
| Changelog | What changed in each version? | Chronological release record |
| Research | What evidence informed a possible decision? | Input only; not a capability claim |

## Repository docs before a separate Wiki

Repository Markdown remains canonical because it is reviewed, versioned, tested, and released with the code it describes. If Temple later needs a documentation site or Wiki-style interface, generate it from this directory and link each published page back to its repository source. Do not maintain the same guide manually in two places.

## Maintaining this index

1. Give every document one primary reader and purpose.
2. Put it in the shallowest applicable category.
3. Put results in validation, rationale in ADRs, chronological changes in the changelog, and exploratory inputs in research.
4. Link it once from its primary category and only add it to the root README when a first-time visitor needs it.
5. Keep English as the canonical documentation language; only the README and roadmap have maintained Japanese and Traditional Chinese editions.
