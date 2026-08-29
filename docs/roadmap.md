# Roadmap: From installable framework to an observable AI development organization

These are engineering phases and exit gates, not date commitments. Expand automation only after the preceding phase has supporting evidence.

## Cross-cutting framework tracks

Every phase advances the same six layers: product intent, organization and authority, engineering methods, work orchestration, verification and delivery, and durable state and observability. Scale is introduced through evidence-backed profiles and extensions rather than by claiming that one fixed process already fits every project.

The Engineering Learning Loop is a cross-cutting track. Alpha.10 establishes project-owned Lessons and Practices, compact retrieval metadata, validation, and status projection. Later automation must be justified by real use: a retrospective Skill, Learning CLI, semantic retrieval, stale-practice alerts, and privacy-safe cross-project promotion are planned rather than implied by the storage foundation.

The capability track begins with a small core, one opt-in Build Quality pack, project-owned Skills, and an alpha.12 generated Capability Registry that observes repository Skills without claiming extension ownership. Later work may add architecture, review, exploration, Git and improvement, and security packs only after bounded pilots. Richer pack manifests, dependency declarations, project and third-party lifecycle commands, and automated model-routing evaluation remain planned.

The UI design track begins with an explicit UI Designer Position and four explicit outcomes: `not-applicable`, code-first, preview-first, and design-led. Alpha.14 records the choice per Work Item and pins approved UI contract revisions when required. Figma remains optional. Project-profile defaults, design-source adapters, token synchronization, and visual-regression integration require later validation.

The product-specification track begins with an alpha.14 project-owned authority registry, revisioned Work Item references, contract-guided iterative delivery, and federated, hybrid, or Temple-native document adoption. External synchronization, semantic contract validation, and organization-specific approval adapters remain outside the current implementation.

The task-coordination track begins with an alpha.15 project-owned tracker contract, explicit company/Work Item/Codex-task layers, configurable visibility and granularity, a bounded GitHub Issues read adapter, normalized manual observations, conflict plans, and evidence-backed repository reconciliation. External writes, Jira live access, and automatic bidirectional synchronization remain outside the current implementation.

The parallel-orchestration track begins with alpha.16 deterministic group planning, dependency- and conflict-safe waves, optional capacity limits, plan-only dispatch manifests, source-fingerprint staleness, and Integration Owner join gates. The CLI remains runtime-neutral and performs no task creation or claim. Real multi-human, multi-machine dispatch and Git-hosting contention remain retained validation rather than claimed production evidence.

## Phase 1: Installable, operational organization skeleton (current release)

Goal: Give any repository the same Positions, identity model, workflow, and checks without depending on chat titles.

Deliverables:

- Central framework repository, MIT License, and third-party provenance.
- `init`, checksum-aware `upgrade`, `doctor`, `status`, and `temple.lock`.
- Ten Positions, naming during first project initialization, and a small five-Identity configuration.
- Managed, project-owned, and generated boundaries.
- Decision interview, domain modeling, governed project Skill authoring, Decision Ledger, ADR, and handoff and QA templates.
- Opt-in Archify adapter contract.
- Sample project, CI, and no-overwrite tests.
- Work-item, handoff, transition, and close CLI commands with named gate evidence.
- Codex task registry, stable title suggestions, revisions, attention signals, and archive readiness.
- Project-owned Engineering Learning index and records, managed Lesson and Practice templates, doctor validation, and status counts.
- UI Designer, a tool-neutral UI delivery-mode policy, a UI design-brief template, and a backward-compatible Assignment migration.
- A project-owned Context Map, generated Capability Registry and work-item Context Capsules, deterministic Retrieval Provider contract, and affected-path overlap warnings.
- A project-owned specification index, revisioned product/UX/UI/API/technical references, contract-guided iterative delivery, enterprise document-adoption guidance, and stale-reference enforcement.
- A project-owned external-tracker configuration, team-visible and internal Work Item mappings, bounded observations, explicit field ownership, reconciliation evidence, doctor/status/context projection, and a read-only GitHub Issues adapter.
- Generated group parallel plans with safe waves, plan-only manifests, stale-plan observation, runtime fallback, and Integration Owner join gates.
- A real English Learning Inbox Safari Share Extension pilot.

Exit gate: Both clean and existing repositories can initialize; all ten Positions are observable; Developer and Independent QA are separate; re-running does not overwrite; and organizational state can be recovered from files after closing the chat.

## Phase 1.5: Greenfield project bootstrap pilot (in progress)

Goal: Starting with an unstructured product idea, create a new private repository, establish product and technical baselines, and deliver the first independently verifiable vertical slice without making the user redesign the development organization.

The existing-repository portability validation in AiPet `WI-0001` satisfied the entry condition.

The private FlowDeck pilot completed:

- First initialization in a new private repository, with the user confirming five Agent Identity names and nine Position Assignments.
- A Project Charter, domain language, core flow, technical baseline, ADR, acceptance criteria, and first durable work item derived from an ambiguous idea.
- The first work item completed Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate.
- The Build Quality pack preserved red/green and diagnosis evidence in a real iOS vertical slice.
- The exact candidate revision passed automated tests, Simulator system integration, Independent QA, and closeout in a clean checkout.
- Project-facing instructions, status, and artifacts used the project name or "this project's AI development organization." `Temple` remained only in the central framework brand, CLI, CLI-specific Skill IDs, schemas, lock, and compatibility identifiers.
- The pilot is frozen under [ADR-0011](adr/0011-pilot-stop-boundary.md); the sample app will not be extended as a formal product.
- Alpha.8 adds exact-match unresolved-item listing, resolution, merge, and deduplication; Developer handoff candidate-revision projection; and copyable post-init doctor and status commands.
- Alpha.8 also installs the independently implemented `$project-documentation` core Skill. A read-only forward-test against the trilingual public README found and drove corrections to stale capability state, prerequisites, verification, repository visibility, and revision wording.
- Alpha.9 adds and forward-tests the core `$skill-authoring` procedure, a public project-extension contract, four distribution classes, and exact-path protection so an untracked project Skill cannot be silently adopted by init, pack installation, or upgrade.
- Alpha.10 adds the minimal Engineering Learning Loop foundation without installing a retrospective Skill or automatic promotion workflow.
- Alpha.11 adds UI Designer and risk-scaled, tool-neutral UI delivery modes without requiring Figma or a pre-implementation mockup for every project.
- Alpha.12 adds deterministic Progressive Context Routing, project Skill discovery without ownership transfer, bounded Context Capsules, and affected-path overlap warnings. Semantic or hybrid retrieval remains an adapter boundary rather than a default dependency.
- Alpha.12 local and CI evidence is preserved in the [Progressive Context Routing validation record](validation/alpha-12-progressive-context-routing.md); real-project cross-task recovery, multi-maintainer behavior, large-repository retrieval quality, and semantic providers remain unverified.
- Alpha.13 adds the Collaborative foundation: Human Principals, Agent sponsorship, Position pools with Disciplines, collision-resistant Collaborative Work Item IDs, parent/dependency and contract fields, deterministic parallel readiness, Principal-backed claims, upgrade migration, and status/doctor observability.
- Alpha.13 bounded local evidence is preserved in the [Collaborative foundation validation record](validation/alpha-13-collaborative-foundation.md).
- Alpha.13 local automated evidence does not replace the retained [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md). Multi-human, multi-machine, Git-hosting behavior remains explicitly `not_run`.
- Alpha.14 adds product-specification authority and revision contracts, enterprise document-adoption modes, Work Item specification references, explicit no-UI handling, tool-neutral interaction contracts, doctor/status/context observability, and upgrade-safe project-owned seeding.
- Alpha.15 adds the task-and-tracker coordination model: separate company planning, repository Work Items, and Codex sessions; preserve AI-only child decomposition; configure mapping granularity; inspect GitHub Issues or supplied observations; plan conflicts; and record reconciliation evidence without external writes.
- Alpha.16 adds group-level parallel planning, deterministic safe waves, explicit runtime-capacity handling, plan-only dispatch manifests, source-fingerprint staleness, Context Capsule routing, and Integration Owner join gates without making the CLI a task runtime.

Phase 1.5 is not yet complete:

- Continue from repository canonical state in a new Codex task and verify that a new conversation can recover product intent and organizational state. FlowDeck did not perform this step and must not be developed further merely to satisfy the gate.

Exit gate: A new, non-example, recoverable product repository that does not touch production moves from idea to first work-item closeout; Developer and Independent QA verify the same revision; a new conversation continues without the originating chat; and the user does not manually rebuild Positions, handoffs, or observation mechanisms.

See the [FlowDeck Greenfield Pilot Retrospective](pilots/flowdeck-greenfield-retrospective.md) for complete results and gaps. AiPet and FlowDeck both support retaining the opt-in Build Quality pack; this pilot does not justify adding other candidate Skills directly.

## Phase 2: Operational MVP

Goal: Strengthen scope coordination, external evidence adapters, and the Observer beyond the alpha.16 collaboration, routing, specification, tracker, and group-orchestration foundation.

Groundwork already available:

- Affected-path overlap warnings across non-terminal work items.
- A project Capability Registry that observes project and third-party Skills without claiming ownership of their files.
- A project-owned Context Map, generated Context Capsules, and a deterministic Retrieval Provider with a future semantic-adapter contract.
- Solo and Collaborative profile selection, Human Principal sponsorship, Position pools with technical Disciplines, bounded work claims, and deterministic parallel-readiness checks.
- Deterministic group planning with safe waves, plan-only dispatch manifests, stale-plan detection, and Integration Owner join gates.
- A project-owned specification authority registry with revision-pinned Work Item contracts and stale-reference blocking.
- Team-visible Work Item mappings, protected field ownership, a bounded GitHub Issues observation adapter, generated conflict plans, and explicit repository reconciliation.

Planned deliverables:

- Validate affected-path coordination and resolution state under real multi-machine Git and pull-request contention.
- Retrieval-quality evaluation, stale-route detection, and a privacy-preserving local hybrid provider only if real projects justify it.
- Pack manifest v2 for references, scripts, assets, declared dependencies, and compatibility metadata.
- Complete the High-Assurance profile contract and risk-based defaults for artifact depth, UI delivery mode, methods, and gates while preserving the ten Position responsibilities.
- More complete JSON Schema runtime validation and a migration registry.
- Evidence adapters for exact Git revisions, tests, runtime, unverified claims, risk, and rollback.
- Observer projections for timeline, staleness, and pending approval.
- Learning CLI mutations, Practice revalidation signals, and retrieval evaluation after project use validates the manual record model.
- Isolated Archify adapter installation, provenance, and graceful-degradation tests.
- A local read-only overview of active, blocked, QA-pending, and approval-pending work.

Exit gate: At least one real, recoverable work item that does not touch production completes the full lifecycle; two parallel work items do not overwrite each other; and every gate is traceable to an actor, revision, and evidence.

## Phase 3: Real-time control plane

Goal: Show progress, failures, and pending approvals without opening every Codex task individually.

Planned deliverables:

- Codex task, turn, and tool-event correlation with replay-safe ingestion.
- Live dashboard for Agent activity, plans, diffs, tests, QA, and release gates.
- Alerts for stalled or orphaned work, scope conflicts, stale evidence, and cost anomalies.
- Human Inbox for approvals, rejections, and additional business facts, written back to canonical approval records.
- Read-only GitHub PR and Checks evidence adapter.

Exit gate: Events appear within reasonable latency; reconnection neither repeats gates nor loses canonical state; interruptions and failures correctly become blocked; and approvals are visible, recorded, and constrain subsequent execution.

## Phase 4: Reliability and everyday multi-project use

Goal: Advance from a single pilot to a personal enterprise-grade development organization that can be trusted every day.

Planned deliverables:

- Backup and restore, event checksums, migration, and crash recovery.
- Policy and evaluation suite covering false completion, wrong revisions, self-approval, unauthorized external operations, and rework.
- A multi-repository registry while each project retains project-local canonical truth.
- Read-only portfolio view with capacity and cost aggregation.
- Secret redaction, data retention, audit export, and notification throttling.
- Migration rehearsal and rollback for framework `upgrade`.

Exit gate: At least ten work items of different types complete; every policy-violation test is blocked or escalated; a clean environment can recover from backup; and the user manages daily work through the Overview and Human Inbox.

## Phase 5: Enterprise-system integration (optional)

Add approved issue-tracker write actions, richer provider adapters, CI/CD write actions, organizational RBAC, remote workers, a centralized audit store, Slack or email notifications, and cross-team portfolios only after Phase 4 proves the workflow. External systems must not replace project-local truth or the Human Approval boundary.

## First-pilot selection criteria

- One to three observable acceptance criteria.
- Verifiable locally, in a test environment, or in Simulator.
- No billing, production data, production deployment, or external notifications.
- Clear affected paths, recoverable changes, and an exact revision that can be preserved.
- Enough scope to complete Spec -> Design -> Build -> Test -> Eval -> Independent QA -> Release Gate.
- The specification must state the experiment purpose, stop condition, and follow-on work that is not automatically authorized. Stop after closeout under ADR-0011.

## Metrics tracked in every phase

- Number of duplicate active scopes.
- Number of rework incidents caused by lost context.
- Proportion of completion claims without evidence.
- Time needed to understand work after a handoff.
- Time that blocked and approval-pending states remain visible.
- Rate of Identity separation between Developer and Independent QA.
