# Changelog

## 0.1.0-alpha.19

- Added Pack manifest v2 with explicit Skill entrypoints, references, scripts, assets, dependencies, provenance, compatibility metadata, full lock metadata, and checksum-safe install, upgrade, and removal.
- Added Draft 2020-12 runtime schema validation with exact document and instance paths plus a managed migration registry and lock-backed baseline/applied history.
- Added atomic Learning CLI operations, explicit v1-to-v2 migration, Lesson-to-Practice derivation, revalidation history and due/contradicted signals, Observer attention, and deterministic hit-rate/MRR evaluation.
- Added a project-owned Retrieval configuration and injectable local-hybrid provider boundary with provenance, reciprocal-rank fusion, privacy declarations, and deterministic failure fallback; no model, embeddings, vector database, daemon, or remote search is installed.
- Made High-Assurance selectable behind two-Principal, full-sponsorship, Developer/Independent-QA, and Developer/Release-Manager separation prerequisites. New High-Assurance Work Items record a risk tier and enforce scaled UI, normalized exact-revision evidence, rollback, and independent approval gates.
- Added an opt-in Archify adapter that accepts only an exact local Git checkout at the pinned MIT-licensed revision, installs into an isolated project-owned directory, records file digests, detects drift, and degrades safely when absent. It performs no download or execution.
- Added status v9, capability flags, ADR-0024 through ADR-0026, extension, High-Assurance, Archify, Learning, Retrieval, architecture, usage, roadmap, trilingual README, and Alpha.19 validation documentation.
- Bound High-Assurance to each Work Item so later profile changes cannot bypass exact-revision, evidence, rollback, or approval gates; `doctor` rejects derived-contract drift and risk severity mapping is explicit.
- Hardened the Archify adapter against dirty pinned checkouts, unsafe or duplicate manifest paths, symbolic links, and unrecorded installed files; local-hybrid semantic ranking can no longer replace canonical repository content.
- Kept retrieval and status inspection read-only when a legacy project has not yet received its project-owned retrieval configuration.
- Preserved explicit limits: real multi-human/multi-machine contention, large-repository retrieval, configured local semantic infrastructure, regulated audit acceptance, external writes, deployment, and publication remain `not_run` or not performed.

## 0.1.0-alpha.18

- Added a project-owned normalized Evidence Registry and local adapters for exact Git revisions, supplied test observations, supplied runtime observations, explicitly unverified claims, risks, and rollback procedures.
- Added content-addressed repository artifacts, exact commit resolution, result-consistency checks, and doctor validation for registry structure, Work Item references, missing artifacts, and digest drift.
- Added a read-only Observer projection for active, blocked, QA-pending, approval-pending, and queued work, with revision-staleness, failed evidence, unverified claim, open high-risk, approval, and runtime-recovery attention.
- Added generated `.ai-org/views/observer.json` and static `.ai-org/views/overview.html`; `observe --no-write` changes no files, and neither mode exposes mutation or approval controls.
- Added ADR-0023, evidence and Observer guidance, managed observation templates and schema, upgrade-safe project-owned seeds, and end-to-end tests.
- Preserved authority boundaries: evidence capture never runs the observed command, satisfies a gate, writes an external tracker, performs a production action, or replaces Independent QA.

## 0.1.0-alpha.17

- Added a project-local `templew.mjs` launcher and `temple.cli-bootstrap/v1` lock contract that pins the framework version and, from a clean source checkout, the exact Git source revision. Development overrides are accepted only after an exact version check.
- Added lifecycle-stage Discipline and shared-resource requirements, project-owned resource definitions and reservations, capacity-aware wave construction, status and doctor observability, and explicit automatic release at terminal worker state.
- Added atomic `parallel prepare` as the claim-before-worker boundary. It validates a fresh deterministic plan, records claim, resources, and a runtime reservation together, restores touched state on failure, and uses per-entry fingerprints so every member of the same verified first wave can be prepared safely.
- Added a runtime-worker registry that distinguishes internal subagents from user-owned Codex tasks. Internal workers attach a runtime ID without entering the task registry; user tasks attach through `task register --worker-id` and remain visible as app tasks.
- Added ADR-0022, runtime-coordination documentation, managed schemas, status v8 projections, upgrade-safe project-owned seeds, trilingual README updates, and end-to-end tests for bootstrap mismatch, stage routing, capacity, rollback, multi-member preparation, runtime correlation, resource release, and stale-plan rejection.
- Kept lifecycle authority explicit: worker completion does not release an attached claim, create a handoff, advance workflow, certify Independent QA, or perform an external action. Real multi-machine contention remains retained and `not_run`.

## 0.1.0-alpha.16

- Added `temple parallel plan` for all active Work Items or one parent's recursive descendants, with deterministic dependency-safe waves, affected-path conflict separation, optional worker limits, and explicit active, sequential, and blocked dispositions.
- Added plan-only dispatch manifests with bounded Context Capsule commands, suggested task titles, Agent and Integration Owner identity, base revisions, paths, dependencies, and explicit proof that planning created no task, claim, or external action.
- Added repository-wide source fingerprints, stale-plan warnings in status v7 and doctor, and per-Work-Item parallel disposition in Context Capsules. Only the first wave of a fresh plan is immediately dispatchable, and every join requires replanning.
- Strengthened overlap resolution so an individual Work Item must name the exact conflict ID and a same-wave group exception requires bidirectional acknowledgement.
- Updated the core `$temple-work` Skill and Position instructions for parallel-by-default execution when scope is already authorized and runtime capacity exists, safe sequential fallback, explicit claims and task registration, and Integration Owner evidence joins.
- Added ADR-0021, parallel-orchestration documentation, trilingual README entry points, managed schema and capability flags, upgrade coverage, the hidden `temple chamber` easter egg, and focused automated tests for waves, dependencies, conflicts, capacity, blockers, no-write behavior, freshness, status, doctor, and context.
- Completed the retained greenfield cold-task recovery test in the private IdeaDock repository. A fresh task recovered product and organizational state without an old-chat summary, consumed a three-worker wave, joined exact revisions, rebuilt stale plans, and closed the first slice after distinct Quality Evaluation and Independent QA runs.
- Marked the Phase 1.5 exit gate complete with a `passed_with_limits` framework result. Clean-host CLI bootstrap, internal-subagent task correlation, lifecycle-stage discipline eligibility, shared Simulator scheduling, and real multi-human or multi-machine execution remain explicit follow-up scope rather than implied capability.

## 0.1.0-alpha.15

- Added a project-owned external-tracker contract with `repository-only`, `linked-tracker`, and `externally-planned` profiles plus parent-only, team-visible, and full mapping granularity.
- Separated company tracker items, Temple Work Items, and Codex tasks; root Work Items default to team-visible while child decomposition defaults to internal and inherits parent references only as context.
- Added explicit field ownership, provider and mapping validation, bounded normalized observations, reconciliation plans, project-owned evidence artifacts, generated tracker views, and protected lifecycle behavior that cannot be advanced by an external completion.
- Added tracker CLI commands for configuration, mapping, read-only inspection, planning, and explicit repository reconciliation; GitHub Issues supports bounded live reads through `gh`, while Jira and generic providers accept reproducible manual observations.
- Extended init, upgrade, doctor, status v6, Context Capsules, managed policies and Position instructions, trilingual README entry points, architecture, usage, collaboration guidance, ADR-0020, and end-to-end tests. This release performs no external tracker writes and stores no credentials.

## 0.1.0-alpha.14

- Added a project-owned specification index for product charters, requirements, Feature Specs, UX flows, UI contracts, API contracts, and technical designs, with explicit repository, external, derived, and unresolved legacy authority.
- Added revisioned `spec_refs`, `ux_refs`, `ui_refs`, and `contract_refs` plus Work Item `ui_delivery_mode`; approved current contracts are required at their lifecycle boundaries and stale references block later delivery until intentionally repinned.
- Added four explicit UI outcomes: `not-applicable`, code-first, preview-first, and design-led. Figma remains optional, while preview-first and design-led require an approved UI contract reference and every interface mode retains runtime review.
- Added contract-guided iterative product-specification guidance, enterprise federated/hybrid/Temple-native adoption, migrate-on-touch rules, tool-neutral UI interaction contracts, managed starting templates, and ADR-0019.
- Extended init, upgrade, doctor, status v5, Context Capsules, managed capabilities, repository checks, and end-to-end tests while keeping the specification index project-owned and external verification offline.

## 0.1.0-alpha.13

- Added selectable Solo and Collaborative profiles while reserving High-Assurance for later validation.
- Added Human Principals, Agent sponsorship, Position Membership pools, technical Disciplines, and Principal-backed Work Item claims without changing Position authority or default Assignments.
- Added collision-resistant Collaborative Work Item IDs, parent and dependency relationships, shared-contract and integration fields, deterministic parallel-readiness checks, and affected-path conflict handling.
- Extended init, upgrade, doctor, status v4, templates, schemas, documentation, and tests, while retaining large multi-human and multi-machine validation as explicitly `not_run`.

## 0.1.0-alpha.12

- Added Progressive Context Routing with a project-owned Context Map and generated work-item Context Capsules that route Agents to bounded canonical sources instead of treating chat or generated views as truth.
- Added `temple capability list/find` and a generated Capability Registry that observes core, optional-pack, and project-owned repository Skills without silently adopting extension files into `temple.lock`.
- Added `--affected-path` and `--context-ref` to work-item creation, safe pre-write validation, and overlap warnings for non-terminal work items that may edit the same scope.
- Added the local `repository-deterministic` Retrieval Provider plus a versioned provider contract for future semantic or hybrid adapters; this release installs no model, embeddings, vector database, daemon, or remote retrieval service.
- Extended doctor, status v3, upgrade migration, schemas, installed Agent instructions, trilingual README, architecture, usage, roadmap, ADR-0017, repository checks, and end-to-end tests for the new routing boundary.

## 0.1.0-alpha.11

- Added UI Designer as the tenth stable Position while retaining the lean five-Agent-Identity configuration; Product Manager, UX Designer, and UI Designer initially share the Product Design Identity.
- Defined code-first, preview-first, and design-led UI delivery modes so pre-implementation artifacts scale with risk, collaboration cost, and visual sensitivity rather than becoming a universal requirement.
- Added a managed, tool-neutral UI design policy and UI design-brief template. Figma is supported as one option but is not a core dependency; every mode still requires runtime visual review.
- Added a deterministic upgrade migration that preserves an existing UI Designer Assignment or assigns the Position to the single active UX Designer Identity, stopping safely when ownership is ambiguous.
- Added ADR-0016, a public UI design guide, aligned trilingual README and operating documentation, repository checks, and migration tests.

## 0.1.0-alpha.10

- Added the Engineering Learning Loop as a governed path from work evidence to Lessons, validated Practices, and optional promotion into the appropriate mechanism.
- Added a compact project-owned `.ai-org/learning/index.json`, managed Lesson and Practice templates, strict metadata and record-reference validation in `temple doctor`, and learning counts in `temple status`.
- Preserved learning across re-init and upgrade without adding it to framework-managed files; older installations receive only an empty seed when the index is missing.
- Clarified Position responsibilities, retrieval guidance, privacy and cross-project boundaries, and the distinction between a retrospective, Lesson, Practice, Skill, automated check, ADR, and instruction.
- Kept the retrospective Skill, Learning CLI, semantic retrieval, automatic promotion, and cross-project synchronization as unshipped candidates pending real project validation.

## 0.1.0-alpha.9

- Repositioned Temple as an **AI Development Organization Framework** spanning product intent, organization and authority, engineering methods, work orchestration, verification and delivery, and durable state and observability.
- Added and independently forward-tested the core `$skill-authoring` Skill and public project-extension guide with discriminating triggers, explicit authority, progressive disclosure, dependency and provenance disclosure, scenario design, completion-scope limits, and a validation ladder.
- Accepted ADR-0013 and separated four capability distribution classes: core, official pack, project extension, and third-party extension. Candidate development Skills remain preserved without expanding every project's default context.
- Made `temple.lock.managed_files` exact membership authoritative. Re-init, pack installation, removal, and upgrade now refuse to silently adopt or overwrite late untracked collisions, use exclusive creation and lock rechecks, and roll back earlier file mutations when a later operation fails, while unique project Skills remain untouched and untracked.
- Aligned the English, Japanese, and Traditional Chinese READMEs, Vision, Roadmap, architecture, usage, capability catalog, and installed instructions with the scalable and extensible framework contract and its current alpha limits.

## 0.1.0-alpha.8

- Added `temple work-item unresolved` for read-only listing plus exact-match resolution, merge, and deduplication under the project mutation lock; invalid or overlapping requests stop before writing and append evidence only when state changes.
- Persisted the Developer candidate revision during handoff so status can project the candidate before release closeout, while keeping Git-object verification as a later evidence-adapter responsibility.
- Added directly copyable post-init doctor and status commands for POSIX shells and PowerShell, using the active Node and CLI paths.
- Added the independently implemented core `$project-documentation` Skill and forward-tested it against the public README redesign; the audit corrected stale capability claims, prerequisites, private-repository access, verification, links, and revision wording.
- Replaced the oversized README with concise English, Japanese, and Traditional Chinese entry points. English is canonical; all other toolkit documentation is now English under ADR-0012 and an automated language check.
- Strengthened doctor and CLI handling for malformed unresolved-item data and added focused mutation, idempotency, command-copyability, candidate-projection, and Skill-routing tests.

## 0.1.0-alpha.7

- Completed the first greenfield lifecycle pilot with FlowDeck and explicitly froze it as a Temple validation sample rather than extending it into a formal product.
- Added a pilot retrospective that separates proven initialization, product definition, Build Quality, and exact-revision closeout from unproven recovery in a new Codex task, task registry behavior, and `$project-documentation`.
- Accepted ADR-0011 and added the pilot purpose, stop condition, excluded follow-on work, and post-closeout stop rule to installed instructions and the operating contract.
- Recorded the next Phase 1.5 hardening work: unresolved-item resolution, candidate-revision projection, and CLI discoverability. One system-fixture issue does not justify expanding the Skill set.
- Updated the roadmap, usage guide, capability catalog, Skill policy, and scenario evidence so that FlowDeck closeout is no longer misreported as completion of all Phase 1.5 work.

## 0.1.0-alpha.6

- Completed the second existing-repository pilot with AiPet `WI-0001`: Simulator lifecycle, six tests, four pieces of UI evidence, clean detached exact-revision Independent QA, and release closeout.
- Organized development capabilities from the Matt Pocock catalog into five optional packs: Build Quality, Architecture, Review, Exploration, and Git and Improvement. Pilot evidence selected `tdd` and `diagnosing-bugs` as the first Temple-native implementation direction.
- Added `codebase-design` and `retro` candidates and explicitly rejected overly broad, in-progress, Claude-specific, or Node-specific Skills as generic core capabilities.
- Added the opt-in Build Quality pack with independent implementations of `$tdd` and `$diagnosing-bugs`; core init does not install it by default.
- Added `temple pack list/install/remove`, a pack manifest, `temple.lock` pack metadata, and checksum-safe install, upgrade, re-init, and removal boundaries.
- Verified that dry-run does not write, conflicts do not produce partial installation, modified pack files are not overwritten or removed, and pack scenarios do not become confused with core Skills.

## 0.1.0-alpha.5

- Preserved `project-documentation` as a Phase 1.5 core candidate, explicitly separated human-facing README and project documentation from AI-facing instructions, and recorded pinned provenance and licenses for two external reference implementations.
- Merged two overlapping interview Skills into `$decision-interview` with conversational and evidence-backed modes. Upgrade removes the old managed Skill only when its checksum is unchanged.
- Narrowed `$temple-work` to explicitly authorized lifecycle mutation and added read-only and persistence authority boundaries to instructions, Position configurations, and decision and domain Skills.
- Added a canonical Skill registry, an exact repository Skill-set check, a Skill scenario matrix, and upgrade-removal tests.
- Preserved Matt Pocock's `research`, `resolving-merge-conflicts`, `wayfinder`, and `triage`, plus OWASP security review, as tiered candidates without expanding core installation directly.

## 0.1.0-alpha.4

- Changed repository identity to `temple-ai-dev-org`, renamed the central installation source from `template/` to `project-overlay/`, and preserved upgrade compatibility with the legacy package identity.
- Renamed interview Skills to the neutral `$decision-interview` and `$evidence-backed-decision-interview`; upgrade removes an old managed Skill only when its checksum is unchanged.
- Added an independently implemented `$domain-modeling` Skill and a project-owned domain-glossary template for Phase 1.5 ubiquitous-language, boundary, and invariant work.
- Added a capability catalog and Skill design policy that preserve TDD, diagnosis, prototype, review, and architecture candidates without installing an entire external catalog into every project.
- Added the MIT License, pinned provenance for Matt Pocock Skills, ADR-0008, and open-source adoption boundaries.

## 0.1.0-alpha.3

- Added the Phase 1.5 Greenfield Project Bootstrap Pilot to the roadmap after AiPet portability validation and before the Phase 2 operational MVP.
- Explicitly separated the central toolkit name from project identity: Temple remains the CLI and technical namespace, while project-facing text uses the project name or AI development organization.
- Adopted project-native wording in status views, the operating contract, instructions, Skills, Agent descriptions, and release closeout.
- Added ADR-0007 to record the long-term boundary between compatibility identifiers and project language.

## 0.1.0-alpha.2

- Added the `work-item create`, `handoff`, named-gate `transition`, and `close` CLI commands.
- Added the Codex task and thread registry, stable title suggestions, revisions, attention signals, and archive readiness.
- Added a short-lived project lock for canonical mutations so parallel CLI processes do not lose work-item, event, or task updates.
- Upgraded `status` to v2 with work-item owner, Agent, task, recent events, and observation signals.
- Added checksum-aware `upgrade`; managed conflicts stop before writing and project-owned state is preserved.
- Added `$temple-work`, release-record, manager-closeout, and task-registry templates.
- Completed the first real low-risk pilot with the English Learning Inbox Safari Share Extension.

## 0.1.0-alpha.1

- Created the three-layer Position, Agent Identity, and Assignment model.
- Added the `init`, `doctor`, and `status` CLI commands.
- Added two portable grill Skills and nine Codex Position configurations.
- Added managed, project-owned, and generated boundaries plus `temple.lock`.
- Added the optional Archify adapter contract, tests, and CI.
