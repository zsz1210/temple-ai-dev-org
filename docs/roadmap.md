# Roadmap: From installable framework to an observable AI development organization

These are engineering phases and exit gates, not date commitments. Expand automation only after the preceding phase has supporting evidence.

## Cross-cutting framework tracks

Every phase advances the same six layers: product intent, organization and authority, engineering methods, work orchestration, verification and delivery, and durable state and observability. Scale is introduced through evidence-backed profiles and extensions rather than by claiming that one fixed process already fits every project.

The Engineering Learning Loop is a cross-cutting track. Alpha.10 established project-owned Lessons and Practices; Alpha.19 adds atomic CLI mutations, revalidation signals, explicit migration, and deterministic retrieval evaluation. Later automation still requires real evidence: a retrospective Skill, automatic promotion, scheduled review, configured semantic retrieval, and privacy-safe cross-project promotion remain planned.

The capability track begins with a small core, one opt-in Build Quality pack, project-owned Skills, and an alpha.12 generated Capability Registry that observes repository Skills without claiming extension ownership. Alpha.19 adds Pack manifest v2 with multi-file composition, dependencies, provenance, and compatibility plus an isolated Archify adapter lifecycle. Architecture, review, exploration, Git and improvement, security packs, custom-pack publishing, generic third-party Skill installation, and model-routing automation still require bounded pilots.

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

## Phase 1.5: Greenfield project bootstrap pilot (exit gate complete)

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
- The retained IdeaDock test created a new private product from an unstructured idea, stopped the originating task before implementation, and asked a fresh Codex task to recover from repository state without a prior-chat summary.
- The fresh task reconstructed product intent, organization, specifications, Work Items, plan, acceptance, ownership, and the stop boundary; consumed a real three-worker first wave; joined exact candidate revisions; rebuilt stale plans; and completed distinct Quality Evaluation and Independent QA runs against the same revision.
- IdeaDock closed all five Work Items with 28/28 Developer, Quality Evaluation, and Independent QA results, a clean 27/27 doctor result, no active claims, and no production release. The product is frozen after its first slice.
- The bounded result is preserved in the [Greenfield cold-task recovery result](validation/greenfield-cold-task-recovery-result.md). It does not validate a clean-host CLI bootstrap, user-owned task records for internal subagents, stage-specific discipline rules, shared Simulator scheduling, or multi-human and multi-machine execution.

Phase 1.5 exit gate is complete:

- A new, non-example product moved from idea to first-slice closeout, Developer and Independent QA verified the same exact revision, a new conversation continued without the originating chat, and the user did not manually rebuild Positions, handoffs, or observation state.
- FlowDeck remains frozen. IdeaDock is also frozen at the declared experiment boundary until a new explicit product request.
- The retained [large-scale real-environment test](validation/collaborative-large-scale-test-plan.md) remains `not_run` and is not implied by Phase 1.5 completion.

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

Delivered increments:

### Phase 2A — Recoverable runtime coordination (`0.1.0-alpha.17`)

- Delivered a repository-visible, version-pinned CLI launcher with exact clean-source Git recovery metadata and no unversioned global fallback.
- Delivered stage-specific Discipline and shared-resource requirements, capacity-aware waves, and observable reservations.
- Delivered atomic claim-before-worker preparation with rollback, per-entry continuation for one verified first wave, and stale or edited plan rejection.
- Delivered separate runtime correlation for internal subagents and user-owned Codex tasks. Worker completion releases resources but does not forge lifecycle progress.
- Local tests cover the declared process boundary. Real multi-machine Git and pull-request contention remains `not_run`.

### Phase 2B — Evidence and Observer surface (`0.1.0-alpha.18`)

- Delivered local evidence adapters for exact Git revisions, supplied tests and runtime observations, explicitly unverified claims, risk, and rollback.
- Delivered Observer projections for lifecycle timeline, evidence staleness, pending approval, and recovery-oriented attention signals.
- Delivered a local read-only overview of active, blocked, QA-pending, approval-pending, and queued work.
- Preserved external writes, command execution, and live production actions as explicit authorization boundaries.

### Phase 2C — Extension and retrieval maturity (`0.1.0-alpha.19`)

- Delivered Pack manifest v2 for references, scripts, assets, declared dependencies, provenance, and compatibility metadata.
- Delivered Draft 2020-12 runtime validation plus an explicit migration registry that does not silently rewrite existing project-owned data.
- Delivered atomic Learning CLI mutations, explicit v1-to-v2 migration, Practice revalidation signals, Observer attention, and deterministic retrieval-quality evaluation.
- Delivered isolated clean-local-source Archify installation, exact provenance, a closed per-file digest set, drift detection, and graceful degradation when absent.
- Delivered the selectable High-Assurance risk contract with human-accountability prerequisites and risk-scaled artifact, UI, normalized evidence, rollback, and approval gates while preserving the ten Position responsibilities. Existing High-Assurance Work Items retain their contract across later profile changes.
- Delivered a privacy-preserving injectable local-hybrid Retrieval Provider boundary with deterministic fallback. The default still installs no model, embeddings, vector database, daemon, or remote retrieval service.

Retained evidence work:

- Validate affected-path coordination and resolution state under real multi-machine Git and pull-request contention.
- Evaluate large-repository retrieval quality and any local hybrid provider with real project corpora before claiming production readiness.

Local exit gate: satisfied through the recoverable lifecycle pilots, deterministic parallel regression cases, normalized evidence, and exact-revision High-Assurance closeout. The retained real multi-machine and large-repository cases above remain required before broader production-readiness claims.

## Phase 3: Real-time control plane

Goal: Show progress, failures, and pending approvals without opening every Codex task individually.

The accepted [Phase 3 design](phase-3-control-plane.md) and [work-item breakdown](phase-3-work-items.md) separate canonical project state, generated local telemetry, and disposable views; expose provider capabilities honestly; and keep runtime permission, business fact, and governance approval authority distinct. Phase 3A and 3B are delivered locally; Phase 3C remains next.

Proposed increments:

- **Phase 3A — Event spine and provider foundation (`0.1.0-alpha.20`, delivered locally):** versioned normalized events, Git-common-dir replay journal, cursor and checkpoint recovery, provider capability contracts, repository and fixture providers, redaction, single-writer lease, rebuild archive, and read-only HTTP/SSE.
- **Phase 3B — Live Observer, Codex adapter, and alerts (`0.1.0-alpha.21`, delivered locally):** provenance-aware live views, a pinned capability-proven Codex App Server adapter, disconnect reconciliation, and stateful actionable conditions.
- **Phase 3C — Human Inbox and GitHub evidence:** authority-separated requests, a policy-checked idempotent command gateway, runtime-request bridging, and an exact-SHA read-only GitHub PR and Checks adapter.

Phase 3 does not promise live access to every task already running in Codex Desktop. Registered or unsupported tasks remain visibly snapshot-only, registered-only, or unknown unless a documented and tested provider proves stronger capabilities.

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
