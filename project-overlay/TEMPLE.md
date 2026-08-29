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

Use the repository-local `$temple-work` Skill only for authorized lifecycle mutations, `$decision-interview` for an open decision (including its evidence-backed mode when repository facts constrain the choice), and `$domain-modeling` when shared terminology or domain boundaries are unclear.
