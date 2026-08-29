# Project AI development organization operating contract

This repository's AI development organization separates responsibility from identity and stores project state outside chat.

Before acting:

1. Read `.ai-org/project/project.json`, `agents.json`, `assignments.json`, and `collaboration.json`.
2. Identify the Position you are acting as and the durable work item ID.
3. Preview the bounded route with `temple context resolve . --work-item <work-item-id> --position <position> --no-write --json`.
4. Read only the routed canonical Spec, Design, ADR, Learning, Skill, and evidence needed for the current responsibility. Generated Context Capsules and Capability Registry entries are navigation aids, not authority.
5. Stay inside that Position's ownership and approval limits.
6. If the work runs in a separate Codex task, use the suggested `Work Item ID · Position · Agent Name` title and register the real task/thread ID in `.ai-org/project/tasks.json` through `temple task register`.

When the request is only to inspect, explain, diagnose, review, or report status, remain read-only. Repository mutation requires explicit authorization from the request or current work item.

Before handoff:

1. Update canonical project files, not only the conversation.
2. Record revision, completed work, evidence, unresolved questions, and next Position.
3. Never let the Developer certify Independent QA for the same work.
4. Request human approval for business truth, priority, external commitments, material cost, irreversible actions, sensitive data, or high-risk release.

Use CLI mutations instead of hand-editing canonical JSON when supported:

```text
temple work-item create → configure/readiness → claim → handoff → transition
                         temple task register/update
                              release claim ↓
                                         temple close
```

Each transition must carry named gate evidence. `temple status` projects work items, assigned Agents, revisions, task status, context-routing and capability counts, installed optional Skill packs, attention signals, recent events, and archive readiness. A task marked archive-ready still requires an explicit app action; the CLI never archives, renames, or creates a Codex task on its own.

## Context routing and parallel work

Keep `.ai-org/project/context-map.json` concise and project-owned. It points to canonical files; it does not copy them. Use `temple capability find` when a reusable method may apply, but selecting a Skill never expands the request's authorization. Record planned write scope through work-item `affected_paths`. When context resolution reports overlap with another non-terminal item, coordinate the work before changing shared paths.

In Collaborative mode, a Human Principal sponsors an Agent Identity, and Position Membership plus Disciplines determine eligibility. Before parallel execution, record scope, acceptance, dependencies, base revision, affected paths, contract status, integration owner, and required Disciplines, then run `temple parallel check`. Respect `sequential` and `blocked` results. Use `temple work-item claim/release` for active ownership. The local mutation lock does not coordinate separate machines; use branches, pull requests, protected rules, CI, and explicit Git conflict resolution.

## Engineering learning

Before similar work, search `.ai-org/learning/index.json` and read only relevant active Practices or validated Lessons. When an authorized retrospective or work item produces reusable evidence, capture the smallest supported Lesson and keep its Markdown record and index entry consistent. A Lesson becomes a Practice only after validation and intentional adoption; promotion to a Skill, automated check, ADR, or recurring instruction is separate and never automatic.

## Pilot and experiment stop boundary

When the authorized scope describes a pilot, example, proof, or template validation:

1. Record the experiment purpose, observable stop condition, and excluded follow-on product work before Build.
2. Treat a successful release-gate closeout as acceptance of that bounded experiment only.
3. Once the stop condition is met, freeze the sample product and return to Engineering Manager or the user for a retrospective.
4. Do not create another product work item, continue feature development, or prepare distribution without a new explicit request.

`go` at organizational closeout never means “keep developing this product.”

Use the repository-local `$temple-work` Skill only for authorized lifecycle mutations, `$decision-interview` for an open decision (including its evidence-backed mode when repository facts constrain the choice), `$domain-modeling` when shared terminology or domain boundaries are unclear, `$project-documentation` when human-facing documentation must be grounded in repository evidence, and `$skill-authoring` when a repeated project procedure should become a governed repository-local Skill.

For user-interface work, UI Designer owns visual direction and selects `code-first`, `preview-first`, or `design-led` from `.ai-org/core/ui-design.json`. Use `.ai-org/templates/ui-design-brief.md` to record the work-item-specific choice, tool, states, provenance, and visual evidence. No mode removes runtime visual review.
