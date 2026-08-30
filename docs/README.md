# Temple documentation

This is the entry point for understanding, adopting, extending, and validating Temple. The root README explains the product; this map routes deeper questions to one authoritative document instead of repeating the same details everywhere.

## Start here

| Your goal | Read first | Then continue with |
|---|---|---|
| Decide whether Temple fits | [Vision and operating model](vision.md) | [Architecture](architecture.md), [Roadmap](roadmap.md) |
| Install it in a project | [Usage guide](usage.md) | [Existing enterprise document adoption](enterprise-document-adoption.md), [Testing strategy](testing.md) |
| Run several agents or people | [Collaborative development](collaboration.md) | [Parallel orchestration](parallel-orchestration.md), [Runtime coordination](runtime-coordination.md) |
| Define product, UX, UI, and API work | [Product specifications](product-specifications.md) | [UI design modes](ui-design.md), [UI interaction contracts](ui-interaction-contracts.md) |
| Add or choose engineering methods | [Capability catalog](capability-catalog.md) | [Skill authoring](skill-authoring.md), [Skill design](skill-design.md) |
| Understand evidence and live status | [Evidence and Observer](evidence-and-observer.md) | [Local control plane](control-plane.md), [High-Assurance](high-assurance.md) |
| Review why a decision was made | [Architecture Decision Records](adr/README.md) | [Validation records](validation/README.md) |

## Use and adopt Temple

- [Usage guide](usage.md) — initialization, existing-project adoption, daily commands, lifecycle, upgrade, and troubleshooting.
- [Product specification system](product-specifications.md) — product truth, Feature Specs, revisions, and Work Item references.
- [Enterprise document adoption](enterprise-document-adoption.md) — preserve, bridge, or migrate an existing documentation system without creating two authorities.
- [UI design modes](ui-design.md) — `not-applicable`, `code-first`, `preview-first`, and `design-led` without a required design vendor.
- [UI interaction contracts](ui-interaction-contracts.md) — connect screen behavior, design evidence, implementation, and backend contracts.
- [Testing strategy](testing.md) — fast local checks, full behavioral CI, release coverage, and explicit live validation.

## Organization and delivery

- [Vision and operating model](vision.md) — framework purpose, Positions, Agent Identities, Skills, and lifecycle.
- [Collaborative development](collaboration.md) — Human Principals, specialists, Position pools, work claims, and multi-maintainer boundaries.
- [Parallel orchestration](parallel-orchestration.md) — dependency-safe waves, affected-path conflicts, preparation, and integration joins.
- [Runtime coordination](runtime-coordination.md) — pinned launcher, workers, shared resources, recovery, and task correlation.
- [Task and tracker coordination](task-and-tracker-coordination.md) — company tracker, Temple Work Item, and Codex task boundaries.
- [High-Assurance profile](high-assurance.md) — risk-scaled evidence, separation of duties, rollback, and human approvals.

## Methods, knowledge, and extensions

- [Capability catalog](capability-catalog.md) — core, optional, candidate, and project-owned engineering capabilities.
- [Context routing](context-routing.md) — Context Map, Capability Registry, Context Capsules, deterministic retrieval, and the optional semantic boundary.
- [Engineering Learning Loop](engineering-learning.md) — Lessons, Practices, revalidation, retrieval, and evidence-based promotion.
- [Skill authoring](skill-authoring.md) — how projects create bounded, verifiable Skills.
- [Skill design](skill-design.md) — triggers, progressive disclosure, authority, and promotion requirements.
- [Skill scenarios](skill-scenarios.md) — routing scenarios and expected behavior.
- [Extension and migration contracts](extension-and-migrations.md) — Pack v2, provenance, compatibility, schemas, and explicit state migration.
- [Archify adapter](archify-adapter.md) — optional isolated installation, pinning, provenance, and graceful degradation.

## Architecture and observability

- [Architecture](architecture.md) — canonical state, file ownership, identity, mutation safety, generated views, and extension boundaries.
- [Evidence and Observer](evidence-and-observer.md) — normalized observations, exact revisions, stale evidence, attention, and closeout scope.
- [Local control plane](control-plane.md) — event journal, providers, live projection, conditions, and authority-separated Human Inbox.
- [Phase 3 control-plane design](phase-3-control-plane.md) and [work items](phase-3-work-items.md) — accepted detailed design and implementation breakdown.

## Status, decisions, and evidence

- [Roadmap](roadmap.md) ([Japanese](roadmap.ja.md), [Traditional Chinese](roadmap.zh-TW.md)) — delivered foundation, current priorities, next gates, and later options.
- [Changelog](../CHANGELOG.md) — chronological release history. Version-by-version details belong here, not in the README or roadmap.
- [Architecture Decision Records](adr/README.md) — accepted decisions and their consequences.
- [Validation records](validation/README.md) — revision-bound evidence and retained gaps.
- [Pre-Phase 4 closeout review](pre-phase-4-closeout-review.md) — the detailed readiness audit that closed the earlier phases and opened Phase 4.
- [Phase 1 contract](phase-1.md) — original foundation scope and exit gate.
- [Official sources](official-sources.md) — external primary sources used for framework decisions.
- [Research](research/README.md) — supporting investigation that is not itself an accepted decision.
- [Pilot records](pilots/README.md) — bounded experiments and stop conditions; pilots are evidence, not products maintained by this repository.

## What each document type means

| Type | Question it answers | Authority |
|---|---|---|
| README | What is this, why should I care, and how do I begin? | Human-facing entry point |
| Guide | How do I use a current capability? | Current operating guidance, grounded in code and tests |
| ADR | Why did the framework choose this design? | Accepted decision until superseded |
| Validation record | What was actually tested, where, and with what limits? | Bounded evidence for one revision and environment |
| Roadmap | What is delivered, being pursued, next, or intentionally later? | Current direction, not release history |
| Changelog | What changed in each version? | Chronological release record |
| Research | What evidence informed a possible decision? | Input only; not a shipped promise |

## Repository docs before a separate Wiki

The Markdown files in this repository are the canonical documentation because they can be reviewed, versioned, tested, and released with the code they describe. A separately edited GitHub Wiki would create a second source of truth and drift quickly.

If Temple later needs a documentation website or Wiki-style interface, generate it from this directory and link every published page back to its repository source. Do not maintain the same guide manually in two places.

## Maintaining this map

When adding a document:

1. Give it one clear purpose and intended reader.
2. Link it from one primary category above.
3. Put historical results in the changelog or a validation record, rationale in an ADR, and exploratory evidence in research.
4. Update the root README only when a new reader needs the link to evaluate or begin using Temple.
5. Keep English as the canonical documentation language; only the README and roadmap have maintained Japanese and Traditional Chinese editions.
