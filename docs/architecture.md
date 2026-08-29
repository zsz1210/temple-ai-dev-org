# Architecture

## Identity and collaboration model

```text
Human Principal (project-defined)
    │ sponsors
    ▼
Agent Identity (project-defined)
    │ joins with Disciplines
    ▼
Position Membership ── eligible for ──> Position (framework-defined)
    │                                      │ authority
    └────────────── claim ────────────────> Work Item + Evidence
```

- The central framework defines each Position's ID, responsibilities, and gates.
- An Agent Identity has a stable `agent_id` and mutable `display_name`; renaming must not change its historical ID.
- An Assignment has an activation state and preserves one default Agent per Position for backward compatibility.
- A Position Membership adds eligible pool members and technical Disciplines without changing Position authority.
- A Human Principal sponsors an Agent Identity and remains attributable when that Agent claims work.
- A Work Item claim binds Principal, Agent, base revision, branch, optional worktree, and timestamps to one bounded scope.

Codex `.codex/agents/*.toml` files are runtime configuration for Positions, not names of project participants. Actual project names are stored in `.ai-org/project/agents.json`.

See [Collaborative development model](collaboration.md) for the complete architecture and work-decomposition diagrams.

## Naming boundary

`Temple` is the name of the central framework, CLI, and technical namespace. It is not the name of an installed project or AI team.

- The central repository, `temple` CLI, `temple.lock`, `temple.*` schemas, CLI-specific Skill IDs, and compatibility markers retain stable names. General-purpose Skills use neutral names.
- After installation, project-facing instructions, status, artifacts, and Agent descriptions use the project name or "this project's AI development organization."
- Project members are not called the Temple team, and the central framework brand does not replace product identity.
- `TEMPLE.md` remains temporarily as a compatibility filename, but its contents are the repository's organizational operating contract, not another external project.

This boundary allows safe central framework upgrades while making installed content a natural part of the product repository.

## File boundaries

| Type | Path | Ownership | Upgrade rule |
|---|---|---|---|
| Managed | Exact files listed in `temple.lock.managed_files`, drawn from `templew.mjs`, `.ai-org/core/**`, `.ai-org/templates/**`, core or installed-pack `.agents/skills/**`, `.codex/agents/**`, and `TEMPLE.md` | Central framework | Update only when the locked checksum matches the installed file |
| Project-owned | Every unlisted file, including repository-local `.agents/skills/**`; `.ai-org/project/**` including `spec-index.json`, `context-map.json`, learning records and index, work items, decisions, events, artifacts, and root `AGENTS.md` | Project | Never overwritten or silently adopted by init, pack install, or upgrade |
| Generated | `.ai-org/views/**`, including status, Capability Registry, parallel dispatch plans, tracker observations and plans, and work-item Context Capsules | CLI/Observer | Rebuildable from canonical state |

`temple.lock` records the framework version, exact managed-file checksums, installed optional packs, feature states, `AGENTS.md` integration state, and a version-pinned CLI bootstrap contract. A clean source installation also records the exact Git source revision used by the project launcher. Directory prefixes are allowed source roots, not ownership claims. An untracked collision stops before writing even when its contents match the proposed managed file. See [ADR-0013](adr/0013-governed-skill-extensions.md) and [ADR-0022](adr/0022-recoverable-runtime-dispatch.md).

## Canonical state

Phase 1 uses Git-friendly JSON and Markdown:

- `project.json`: project identity and initialization time.
- `agents.json`: Agent Identities.
- `assignments.json`: mappings from Positions to Identities.
- `collaboration.json`: selected profile, Human Principals, sponsorships, Position Memberships with Disciplines, and the large-scale validation status.
- `tasks.json`: stable IDs, Positions, Agents, revisions, and states for separate user-owned Codex tasks and threads; internal subagents do not enter this registry and it is not an app-control API.
- `runtime-workers.json`: internal-subagent or user-task reservations tied to an exact Work Item claim, plan, wave, runtime identity, evidence, and optional task record.
- `resources.json`: project-defined runtime or verification capacity and worker-owned active or released reservations.
- `spec-index.json`: compact identity, authority, status, source, revision, approval, and relationship metadata for product, UX, UI, API, and technical specifications. It points to authoritative documents rather than copying their bodies.
- `tracker.json`: selected external-planning profile, provider identities, mapping granularity, field ownership, and read/write policy. It contains no credentials.
- `context-map.json`: compact project-owned routes to important Specs, ADRs, domain sources, runbooks, tests, and documentation; it contains paths and retrieval metadata, not copied source bodies.
- `learning/index.json`: compact retrieval metadata for Lessons and Practices.
- `learning/lessons/*.md` and `learning/practices/*.md`: full project evidence, applicability, guidance, and validation history.
- `artifacts/**`: project-owned design, evaluation, runtime, and other evidence, including UI briefs and referenced previews.
- `work-items/*.json`: work state, parent/dependencies, coordination fields, external tracker references and reconciliation records, claims, and evidence pointers.
- `decisions/*.md`: Decision Ledger entries and ADR proposals.
- `events/events.jsonl`: an append-only event stream.
- `views/status.md`: a projection generated by `temple status`.
- `views/capabilities.json`: a generated inventory of repository Skills, distribution, invocation metadata, and lifecycle ownership.
- `views/tracker.json`: bounded external observations and conflict plans for currently mapped Work Items.
- `views/parallel-plan.json`: deterministic safe waves, plan-only dispatch manifests, join gates, source and per-entry preparation fingerprints; planning creates no task or claim.
- `views/work-items/WI-####.json`: a generated bounded Context Capsule for one work item and Position.

Conversations can recover context from these files; conversations themselves cannot override them.

## Product specification and authority

Temple uses contract-guided iterative delivery. An `indexed` Work Item pins at least one approved product-specification revision and may also pin the exact UX, UI, and implementation-contract revisions it depends on. A lightweight `gate-evidence` item instead relies on the lifecycle's named approved-scope and acceptance evidence and explicitly does not claim indexed product-scope governance; supporting indexed UX, UI, API, or technical contracts may still govern their declared subjects. `temple_native` records repository authority, `authoritative_external` preserves an existing business system as authority, `derived_projection` marks a local navigation copy that cannot govern delivery, and `legacy_unverified` keeps uncertain material visible without pretending it is approved.

The specification index is an authority registry, while the Context Map is a retrieval index. Neither duplicates the source body. Work Item `contract_refs` pin governed API or technical-design entries by stable ID and revision; `shared_contract_refs` identify coordination surfaces used by parallel implementation and do not by themselves establish product authority. See [Product specification system](product-specifications.md), [Enterprise document adoption](enterprise-document-adoption.md), and [ADR-0019](adr/0019-product-specification-and-external-source-contracts.md).

## Progressive context routing

An Agent begins from the work item, Position, and Context Map rather than loading the whole repository. `temple context resolve` uses the default deterministic Retrieval Provider to score relevant routes, active Practices, validated Lessons, and installed repository Skills. It also compares declared `affected_paths` with other non-terminal work items and reports the Work Item's current parallel-plan disposition and freshness. The result contains paths, scores, reasons, provider provenance, and warnings; the referenced canonical files still provide the actual truth.

The default provider is local and reports `semantic: false`. The `temple.retrieval-provider/v1` contract permits a future local semantic or hybrid adapter, but no model, vector database, daemon, or third-party search service is installed or selected in this release. See [Progressive context routing](context-routing.md) and [ADR-0017](adr/0017-progressive-context-routing.md).

## Task and external tracker boundaries

Company trackers, Temple Work Items, and Codex tasks have different identities and authority. A company item may map to a team-visible parent Work Item; internal child Work Items hold AI decomposition; registered Codex tasks record execution sessions. Tracker observations can inform planning, but an external completion cannot advance the repository lifecycle. See [Task and external tracker coordination](task-and-tracker-coordination.md) and [ADR-0020](adr/0020-external-tracker-coordination.md).

## Command responsibilities

### `temple init`

Validate initialization configuration, preview the file plan, reject managed conflicts, create project identity and Assignments, install `templew.mjs`, and write the lock with its exact CLI bootstrap metadata. Without a configuration file, users may enter five names manually in an interactive terminal; the `$temple-init` Skill coordinates AI-assisted name suggestions. Subsequent repository commands should use `node ./templew.mjs` so execution stays tied to the installed framework version.

### `temple doctor`

Validate managed checksums and the pinned launcher, the JSON model, Position completeness, Agent-name uniqueness, collaboration profiles and memberships, active claims, stage requirements, worker-to-claim and worker-to-resource integrity, internal/user-task separation, Developer and Independent QA separation, the specification index and revisioned Work Item references, tracker configuration and mappings, active Context Map paths, work-item context references and affected paths, generated parallel-plan validity and freshness, the Retrieval Provider contract, the Capability Registry, the learning index and record references, Skills, and `AGENTS.md` integration. Collaborative projects warn until the retained large-scale validation passes.

### `temple status`

Read canonical state and output the collaboration profile, Principal and membership counts, active claims, stage requirements, runtime workers, shared-resource saturation, parallel-plan validity, freshness and disposition counts, specification authority and status counts, tracker mappings and reconciliation actions, stale Work Item references, the user-task registry, context-routing and capability counts, learning counts, revisions, attention signals, recent events, and archive readiness. It may update generated views, but never turns a view back into a decision.

### Tracker commands

- `temple tracker configure/show/remove-provider` maintains project-owned provider identity and policy without credentials.
- `temple tracker set-visibility/link/unlink` maintains explicit Work Item mappings. Internal Work Items cannot have direct mappings.
- `temple tracker inspect/plan` reads a bounded live or supplied observation and optionally rebuilds the generated tracker view. `--no-write` is fully read-only.
- `temple tracker reconcile` records one explicit resolution and its repository evidence. Alpha.15 performs no external mutation.

### Collaboration and parallel commands

- `temple collaboration` configures the selected profile, Human Principals, Agent Identities, sponsorships, and Position Memberships.
- `temple work-item configure` records parent/dependency links, default or stage-specific Disciplines, stage-specific resource requirements, base revision, shared-contract status, integration owner, overlap resolution, and requested parallel mode.
- `temple parallel check` evaluates the deterministic readiness contract without mutating canonical state.
- `temple parallel plan` selects all active Work Items or one parent's descendants, derives dependency-, path-, and resource-capacity-safe waves, applies an optional worker limit, and writes a generated plan unless `--no-write` is set. It never creates tasks, claims, or external actions.
- `temple parallel prepare` accepts only an unchanged dispatch entry in the stored first wave and atomically records its eligible claim, shared-resource reservations, and runtime-worker reservation before the runtime is created.
- `temple worker attach/update/list` correlates internal runtime IDs or user-task reservations, exact revisions, evidence, and terminal resource release. Internal subagents never become Codex task records.
- `temple resource define/list` maintains project-owned shared-capacity definitions and observes reservations.
- `temple work-item claim/release` records and closes Principal-backed ownership of a bounded Work Item.

Only the first wave of a verified plan is an immediate preparation candidate. Per-entry fingerprints permit untouched siblings from the same previously verified first wave to be prepared after an earlier sibling changes runtime state; other canonical changes require replanning. The named Integration Owner joins candidate revisions, verification, and unresolved items before dependent work. See [Parallel orchestration](parallel-orchestration.md), [Runtime coordination and recovery](runtime-coordination.md), [ADR-0021](adr/0021-safe-group-parallel-orchestration.md), and [ADR-0022](adr/0022-recoverable-runtime-dispatch.md).

### Capability and context commands

- `temple capability list/find` inventories repository Skills and retrieves likely methods. Project extensions remain unlisted in `temple.lock` and project-owned.
- `temple context resolve` creates or previews a bounded Context Capsule for a work item. `--no-write` keeps the operation read-only; otherwise the output is a generated view.
- `--spec-ref`, `--ux-ref`, `--ui-ref`, and `--contract-ref` pin governed specification IDs and revisions. `--affected-path` and `--context-ref` make coordination and explicit routing durable without copying document content into the work item.

### Lifecycle commands

- `temple work-item create` allocates the next sequential Solo ID or a collision-resistant Collaborative ID and can record revisioned specification references plus a Work Item UI delivery mode.
- `temple handoff` produces an evidence-backed handoff document.
- `temple transition` allows only edges defined by the workflow, and every `requires` entry must have a named evidence reference.
- `temple close` produces a release record and requires a caller-supplied tested revision reference, rollback plan, and approval record; it does not yet resolve that reference as a Git object or perform an external release.
- `temple task register/update/list` maintains separate user-owned task and thread records, can attach a `user-task` runtime reservation, and does not directly operate the Codex app. Internal subagents use the worker registry instead.

Every lifecycle and task mutation acquires a short-lived exclusive lock in the system temporary directory, named from a hash of the project path. Init, upgrade, and pack mutations re-plan under the same lock. New files use exclusive creation, existing managed files and the lock are rechecked before mutation, and a file journal rolls back completed steps when a later write fails. Rollback never overwrites content changed again by an external writer; it reports an incomplete rollback for manual review instead. Other processes wait briefly and stop on timeout. A lock older than five minutes is treated as crash residue and may be cleared by the next command. The lock is outside the repository and is not canonical state. It coordinates processes in one checkout only; it is not a distributed lock across machines. Cross-machine collaboration must use Git branches, pull requests, protected-branch rules, CI, and explicit conflict resolution.

### Optional pack commands

- `temple pack list` shows centrally available versions, installation state, and included Skills.
- `temple pack install --pack build-quality` copies pack files only after an explicit invocation, then writes the version, Skills, managed paths, and checksums to `temple.lock`.
- `temple pack remove` removes only pack files whose checksums still match the lock. Project modifications stop the operation before any write.

Pack sources live in central `packs/<pack-id>/`, not `project-overlay/`. Core initialization therefore stays small, and a pack does not enter product projects merely because it exists in the central repository.

### `temple upgrade`

Upgrade first validates every installed managed file against the old `temple.lock`. Only core and optional-pack managed files with unchanged checksums may be updated. A proposed new managed path must not already exist unless its exact path is already managed by the installed lock. Installed packs update their metadata and source; uninstalled packs are not enabled automatically. Project-owned files are never overwritten or silently adopted, and generated status may be rebuilt.

Upgrade preserves existing project-owned specification and tracker configuration files. For older installations without them, it creates only empty seeds outside `temple.lock` so the project can adopt, bridge, migrate, or link existing systems deliberately.

When upgrading an organization created before UI Designer existed, the migration preserves an existing active UI Designer Assignment. Otherwise it adds UI Designer to the single active UX Designer Agent Identity. Ambiguous or invalid Assignment state stops the upgrade before the migration writes.

The managed `.ai-org/core/ui-design.json` defines `not-applicable`, code-first, preview-first, and design-led evidence requirements. The selected mode is recorded on the Work Item, while the rationale and evidence live in a project-owned UI design brief derived from `.ai-org/templates/ui-design-brief.md`. The tool itself is not a framework dependency. An approved UI interaction contract can map states and actions to design nodes, code surfaces, backend contracts, and runtime evidence without requiring Figma. See [UI interaction contracts](ui-interaction-contracts.md).

## Archify Adapter

Archify is responsible only for turning selected architecture or process data into a visual artifact:

```text
Canonical files → read-only adapter → Archify input → HTML/artifact
```

The output must identify its source revision and generation time. Archify must not create work items, approve releases, or change Agent Assignments. Phase 1 pins only the contract and does not automatically install or execute third-party code.
