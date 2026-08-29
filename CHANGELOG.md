# Changelog

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
