# Project AI development organization operating contract

This repository's AI development organization separates responsibility from identity and stores project state outside chat.

Before acting:

1. Read `.ai-org/project/project.json`, `agents.json`, and `assignments.json`.
2. Identify the Position you are acting as and the durable work item ID.
3. Read the relevant Spec, Design, ADR, and evidence.
4. Stay inside that Position's ownership and approval limits.
5. If the work runs in a separate Codex task, use the suggested `WI-#### · Position · Agent Name` title and register the real task/thread ID in `.ai-org/project/tasks.json` through `temple task register`.

When the request is only to inspect, explain, diagnose, review, or report status, remain read-only. Repository mutation requires explicit authorization from the request or current work item.

Before handoff:

1. Update canonical project files, not only the conversation.
2. Record revision, completed work, evidence, unresolved questions, and next Position.
3. Never let the Developer certify Independent QA for the same work.
4. Request human approval for business truth, priority, external commitments, material cost, irreversible actions, sensitive data, or high-risk release.

Use CLI mutations instead of hand-editing canonical JSON when supported:

```text
temple work-item create → temple handoff → temple transition
                         temple task register/update
                                      ↓
                              temple close
```

Each transition must carry named gate evidence. `temple status` projects work items, assigned Agents, revisions, task status, installed optional Skill packs, attention signals, recent events, and archive readiness. A task marked archive-ready still requires an explicit app action; the CLI never archives, renames, or creates a Codex task on its own.

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
