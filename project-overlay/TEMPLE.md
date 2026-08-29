# Project AI development organization operating contract

This repository's AI development organization separates responsibility from identity and stores project state outside chat.

Before acting:

1. Read `.ai-org/project/project.json`, `agents.json`, `assignments.json`, `collaboration.json`, `spec-index.json`, `tracker.json`, `retrieval.json`, `evidence.json`, and `control-plane.json` as relevant to the work.
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

Use the repository-pinned `node ./templew.mjs` launcher instead of hand-editing canonical JSON when supported:

```text
work-item create → configure/readiness → parallel plan → parallel prepare
                                                     ├→ internal worker attach/update
                                                     └→ user task register/update
                      handoff → release claim → transition → close
```

## External tracker coordination

Treat the company issue tracker, this repository's Work Items, and Codex tasks as three connected but distinct layers. Jira, GitHub Issues, or another configured provider may remain the human team's planning surface. A team-visible Work Item maps one bounded outcome to that surface; internal child Work Items hold AI-only decomposition. A Codex task is only an execution session for a Work Item.

Read `.ai-org/project/tracker.json` before using an external reference. Never store tracker credentials in the repository. Use `temple tracker inspect` or `temple tracker plan` to create a bounded observation and reconciliation plan. `temple tracker reconcile` records a human-readable resolution and repository evidence; in this release it never writes externally. External `done` or `cancelled` state cannot bypass lifecycle evidence, Independent QA, or the Release Gate. Any future write-back requires explicit authorization for the exact mutation.

Each transition must carry named gate evidence. `temple status` projects work items, risk contracts, assigned Agents, revisions, task status, context and retrieval configuration, Learning revalidation, optional packs and adapters, attention signals, recent events, and archive readiness. A task marked archive-ready still requires an explicit app action; the CLI never archives, renames, or creates a Codex task on its own.

The local control plane combines this canonical state with generated telemetry below the Git common directory. Treat provider events, cursors, plans, diffs, usage, health, alerts, and browser projections as observations only. They cannot satisfy a gate or replace the Work Item, Evidence Registry, approval record, or canonical audit stream. Unsupported provider capabilities must remain `unknown` or unavailable rather than being inferred from task registration.

## Product specification authority

Treat `.ai-org/project/spec-index.json` as the project-owned registry of governing product, UX, UI, API, and technical-design documents. It points to repository or external sources and records their authority, approval, and revision; it does not replace the documents. A generated or local projection of an external source is never equal authority. An `indexed` Work Item pins at least one approved current product entry before Design; a lightweight `gate-evidence` item instead relies on named approved-scope and acceptance evidence and cannot claim indexed product-scope revision protection. Supporting indexed UX, UI, API, or technical contracts may still govern their declared subjects. Approved repository-native entries pin a source SHA-256. When a governing revision or content digest changes, reconcile the source and intentionally repin affected Work Items rather than silently accepting stale scope.

Use `contract_refs` for governed API or technical-design specification IDs and revisions. Use `shared_contract_refs` only to coordinate shared implementation surfaces in parallel work; those paths do not establish product authority.

## Context routing and parallel work

Keep `.ai-org/project/context-map.json` concise and project-owned. It points to canonical files; it does not copy them. Use `temple capability find` when a reusable method may apply, but selecting a Skill never expands the request's authorization. Record planned write scope through work-item `affected_paths`. When context resolution reports overlap with another non-terminal item, coordinate the work before changing shared paths.

In Collaborative or High-Assurance mode, a Human Principal sponsors an Agent Identity, and Position Membership plus Disciplines determine eligibility. Before parallel execution, record scope, acceptance, dependencies, base revision, affected paths, contract status, integration owner, stage-specific Disciplines, shared runtime or verification resources, and overlap resolutions that name the conflicting Work Item IDs. Use `parallel check` for one item and `parallel plan` for a decomposed group. A plan places safe work into deterministic waves but creates no task or claim. Before creating each first-wave runtime, `parallel prepare` atomically records the eligible claim, resource reservations, and runtime-worker reservation. Attach internal subagents with `worker attach`; register only separate user-owned tasks with the reserved worker ID. A terminal worker releases resources but does not forge a handoff, claim release, lifecycle transition, or independent verification. When implementation is authorized and concurrent workers exist, dispatch the prepared first wave up to runtime capacity. Otherwise preserve the same wave boundary and work sequentially. The named Integration Owner joins revisions, verification, and unresolved items before dependent work or lifecycle advancement, then the group must be replanned. The local mutation lock does not coordinate separate machines; use claims, branches, pull requests, protected rules, CI, and explicit Git conflict resolution.

## High-Assurance risk contract

When `collaboration.json` selects `high-assurance`, every active Agent Identity must have a Human Principal sponsor, Developer must differ from Independent QA and Release Manager, and each new Work Item must carry a risk tier. Read `.ai-org/core/high-assurance.json` before changing its lifecycle. Use normalized Evidence IDs at the additional risk, exact-candidate, test, and Independent QA gates. Resolve handoff and tested revisions to exact commits. Close only with risk-appropriate rollback evidence and a repository `temple.approval/v1` record from the required distinct Human Principals. Organizational closeout never authorizes an external action.

## Engineering learning

Before similar work, search `.ai-org/learning/index.json` and read only relevant active Practices or validated Lessons. When an authorized retrospective or work item produces reusable evidence, use `temple learning add-lesson` or `add-practice` so the Markdown record, v2 index, and event history stay consistent. Use `learning revalidate` to confirm, narrow, or contradict guidance and schedule review. A Lesson becomes a Practice only after validation and intentional adoption; promotion to a Skill, automated check, ADR, or recurring instruction is separate and never automatic.

## Pilot and experiment stop boundary

When the authorized scope describes a pilot, example, proof, or template validation:

1. Record the experiment purpose, observable stop condition, and excluded follow-on product work before Build.
2. Treat a successful release-gate closeout as acceptance of that bounded experiment only.
3. Once the stop condition is met, freeze the sample product and return to Engineering Manager or the user for a retrospective.
4. Do not create another product work item, continue feature development, or prepare distribution without a new explicit request.

`go` at organizational closeout never means “keep developing this product.”

Use the repository-local `$temple-work` Skill only for authorized lifecycle mutations, `$decision-interview` for an open decision (including its evidence-backed mode when repository facts constrain the choice), `$domain-modeling` when shared terminology or domain boundaries are unclear, `$project-documentation` when human-facing documentation must be grounded in repository evidence, and `$skill-authoring` when a repeated project procedure should become a governed repository-local Skill.

Record `not-applicable` for work with no user-facing interface and attach no `ui_refs`. For user-interface work, UI Designer owns visual direction and selects `code-first`, `preview-first`, or `design-led` from `.ai-org/core/ui-design.json`. The choice must be explicit before Build. Record the mode on the Work Item and use `.ai-org/templates/ui-design-brief.md` for its rationale, selected medium, states, provenance, and visual evidence. Figma is only one possible medium; code-first permits the responsible AI to propose the first executable UI. Preview-first and design-led pin an approved `ui_ref`; prebuild and `go` closeout require the evidence named by the selected policy mode, and no interface mode removes runtime visual review.
