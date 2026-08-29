# Usage guide

## 1. Install the central framework

```bash
git clone git@github.com:zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
# Optional: expose the local CLI as `temple`
npm link
temple --version
```

Clone the central framework once. Install it into each product repository with `temple init`; no fork is required. `project-overlay/` is only the installation source inside the central repository. Its contents are installed directly at the product repository root.

## 2. First initialization

### Recommended: use Codex assistance

For the first run, open Codex in the central framework repository and provide the absolute path to the target repository:

> Use temple-init with `/absolute/path/to/target`. Suggest English names for the five Assignment slots, wait for my confirmation, and then initialize the project.

The AI must display Position mappings and proposed names first. It may create the configuration and run `init` only after confirmation. After installation, the target repository receives `$temple-init`, `$temple-work`, `$decision-interview`, `$domain-modeling`, `$project-documentation`, and `$skill-authoring`. The central repository itself contains no default names.

### Manual configuration

Create a JSON file that does not need to be committed to Git:

```json
{
  "schema_version": "temple.init/v1",
  "project": { "id": "product-id", "name": "Product Name" },
  "naming_mode": "manual",
  "agents": [
    { "display_name": "Name One", "positions": ["engineering_manager", "release_manager", "observer"] },
    { "display_name": "Name Two", "positions": ["product_manager", "ux_designer", "ui_designer"] },
    { "display_name": "Name Three", "positions": ["tech_lead"] },
    { "display_name": "Name Four", "positions": ["developer"] },
    { "display_name": "Name Five", "positions": ["quality_evaluator", "independent_qa"] }
  ]
}
```

Preview and apply:

```bash
temple init . --config /path/to/config.json --dry-run
temple init . --config /path/to/config.json
```

After a successful init, the CLI prints directly copyable `doctor` and `status` commands using the active CLI path. It labels POSIX-shell output on macOS and Linux and PowerShell output on Windows.

If the target already has `AGENTS.md`, Temple leaves it unchanged by default and doctor reports a pending-integration warning. Add `--integrate-agents` only after confirming that Temple may append its managed block.

### Move from Solo to Collaborative

Initialization starts in the backward-compatible Solo profile. When several people will operate their own Agents, register the accountable Human Principals and additional Agent Identities before selecting Collaborative:

```bash
temple collaboration add-principal . --principal-id principal-alice --name "Alice Morgan"
temple collaboration add-agent . --agent-id agent-taylor --name "Taylor Brooks"
temple collaboration sponsor . --principal-id principal-alice --agent-id agent-taylor
temple collaboration add-membership . \
  --agent-id agent-taylor \
  --position developer \
  --discipline backend
temple collaboration set-profile . --profile collaborative
temple collaboration show .
temple doctor .
```

The original Assignment remains the default Position owner. A membership makes another Agent eligible for bounded claims; it does not replace the default Assignment or change the Position's authority. Add more `--discipline` values for a full-stack or cross-specialty Agent. High-Assurance is cataloged but cannot be selected in this release.

Collaborative Work Item IDs include a date and random suffix so separate clones are unlikely to allocate the same file. This is not distributed locking. Use protected branches, pull requests, CI, and normal Git conflict handling across machines. See the [Collaborative development model](collaboration.md).

## 3. Optional Build Quality pack

Core init does not automatically install development Skills. When observable red-green work and bounded bug diagnosis are needed, inspect and preview the pack first:

```bash
temple pack list .
temple pack install . --pack build-quality --dry-run
temple pack install . --pack build-quality
temple doctor .
```

Build Quality provides:

- `$tdd`: For authorized implementation with a stable public seam, preserve red, the minimum implementation, green, and regression evidence.
- `$diagnosing-bugs`: Find the smallest root cause from a reproducible symptom, ranked hypotheses, and discriminating evidence. Diagnosis is read-only by default and modifies the product only when authorized.

Removal can also be previewed:

```bash
temple pack remove . --pack build-quality --dry-run
temple pack remove . --pack build-quality
```

Pack files are checksum-managed. If a project modifies one, install, upgrade, or remove stops. Do not bypass the guard by editing `temple.lock` manually.

## 4. Add a project-owned Skill

When a repeated project procedure deserves its own capability, invoke `$skill-authoring` and provide the intended outcome plus the target repository. The Skill first distinguishes a reusable procedure from a Position responsibility, project fact, one-time workaround, or missing deterministic tool.

Project extensions live at collision-free `.agents/skills/<skill-name>/` paths. Before editing, inspect the exact entries in `temple.lock.managed_files`; do not replace a managed Skill or hand-edit the lock. Re-init and upgrade preserve unlisted project files and stop if a future core or pack path collides with one.

The authoring procedure defines the trigger, neighboring non-trigger, authority, dependencies, provenance, completion boundary, scenarios, and validation evidence. It does not authorize dependency installation, publication, external actions, the Skill's target operation, or promotion into core or an official pack. See [Extending a project with Skills](skill-authoring.md).

The current alpha does not provide Skill mutation or installation commands, custom-pack publishing, dependency resolution, automated model-routing evaluation, or third-party update management. It does generate a read-only Capability Registry from repository Skills; discovery does not install, approve, or take ownership of a project extension.

## 5. Retrieve and preserve engineering learning

Search `.ai-org/learning/index.json` before repeating similar work. The index contains compact retrieval fields—summary, tags, applicability, status, source work items, validation dates, and the full record path—rather than duplicating the complete evidence. Read only entries relevant to the current Position, work item, and technical area.

When the user or an authorized work item asks to preserve learning, copy `.ai-org/templates/lesson.md` to `.ai-org/learning/lessons/LESSON-####.md` and add the matching index entry. A valid entry has this shape:

```json
{
  "id": "LESSON-0001",
  "kind": "lesson",
  "title": "Keep runtime evidence revision-specific",
  "summary": "Runtime evidence is trustworthy only when its tested revision is recorded.",
  "status": "candidate",
  "confidence": "medium",
  "tags": ["verification", "revision"],
  "applies_to": ["release-gate", "independent-qa"],
  "source_work_items": ["WI-0001"],
  "path": ".ai-org/learning/lessons/LESSON-0001.md",
  "updated_at": "2026-08-29",
  "last_validated_at": null,
  "promotion": { "target": "none", "status": "none", "reference": null }
}
```

Keep the Markdown record and index entry consistent. Lesson states are `candidate`, `validated`, and `deprecated`; Practice states are `candidate`, `active`, and `deprecated`. Promotion is separate and optional. A Skill is appropriate only for a reusable, non-obvious procedure; use an automated check for a deterministic condition, an ADR for a decision, or an instruction for an explicitly approved recurring rule. See the [Engineering Learning Loop](engineering-learning.md).

The current alpha validates and reports learning but has no `temple learning` mutation command, automatic retrospective, semantic retrieval, or automatic promotion.

## 6. Route bounded context and discover capabilities

Maintain `.ai-org/project/context-map.json` as a thin index of important canonical sources. Store paths, short summaries, tags, relevant Positions, and read conditions; do not copy the full Spec, ADR, or runbook into the map. Active route paths must exist, and `temple doctor` validates them.

Inspect the generated repository capability inventory or search for a relevant method:

```bash
temple capability list .
temple capability find . --query "checkout documentation" --position developer
```

When creating work, record likely write scope and explicitly known context routes:

```bash
temple work-item create . \
  --title "Verify checkout totals" \
  --scope "Checkout calculation and tests" \
  --acceptance "Independent QA reproduces public totals" \
  --affected-path "src/checkout/**" \
  --context-ref checkout-spec
```

Before acting in a Position, preview its bounded Context Capsule:

```bash
temple context resolve . \
  --work-item WI-0001 \
  --position developer \
  --revision abc123 \
  --no-write \
  --json
```

The result routes to matching Context Map entries, active Practices, validated Lessons, and repository Skills. It also reports affected-path overlap with other active work items. Remove `--no-write` to save the generated view under `.ai-org/views/work-items/`; never edit that projection as canonical state.

The shipped Retrieval Provider is deterministic, repository-local, and `semantic: false`. A versioned adapter contract reserves future local semantic or hybrid retrieval, but the current CLI does not install or select a model, embedding index, vector database, daemon, or remote search service. See [Progressive context routing](context-routing.md).

## 7. Register product specifications

Maintain `.ai-org/project/spec-index.json` as a compact project-owned authority registry. The document body may remain in the repository or in an approved external system; the index stores only stable identity, kind, authority, status, revision, source, ownership, approval, and relationships. Choose `federated` when existing external systems remain authoritative, `temple-native` when governed documents live in the repository, or `hybrid` when both are used.

Copy the relevant managed template into a project-owned document location, or register an existing external source. For example:

```json
{
  "id": "FEATURE-CHECKOUT",
  "kind": "feature_spec",
  "title": "Checkout totals",
  "authority": "authoritative_external",
  "status": "approved",
  "revision": "confluence-v12",
  "source": {
    "kind": "external",
    "location": "https://docs.example.com/checkout",
    "system": "confluence",
    "content_sha256": null
  },
  "owner_position": "product_manager",
  "approved_by": "product-owner",
  "approved_at": "2026-08-29T10:00:00Z",
  "approval_ref": "https://docs.example.com/checkout/approvals/12",
  "source_refs": [],
  "related_work_items": [],
  "updated_at": "2026-08-29T10:00:00Z"
}
```

Do not treat a repository summary of an external business document as equal authority. Mark that summary `derived_projection` and pin its `source_refs` to the current authoritative entry revision. Mark uncertain legacy material `legacy_unverified` until its owner resolves it. Approved entries require an attributable actor, ISO UTC approval time, and `approval_ref`. Approved `temple_native` sources also record `content_sha256`; `temple doctor` checks all indexed repository sources, while lifecycle and context commands check the sources referenced by the active Work Item. External systems are not contacted automatically, and the current alpha requires an HTTP(S) URL for an `external` source location.

Pin the exact approved contracts when work is created or configured:

```bash
temple work-item create . \
  --title "Verify checkout totals" \
  --scope "One checkout calculation slice" \
  --acceptance "Independent QA reproduces the approved totals" \
  --spec-mode indexed \
  --spec-ref FEATURE-CHECKOUT@confluence-v12 \
  --contract-ref API-CHECKOUT@openapi-v4 \
  --ui-mode code-first
```

Use repeatable `--spec-ref`, `--ux-ref`, `--ui-ref`, and `--contract-ref` values. Configure updates matching IDs and preserves sibling references. Use `--replace-spec-refs`, `--replace-ux-refs`, `--replace-ui-refs`, or `--replace-contract-refs` only when intentionally replacing or clearing that complete category. Temple requires supplied references to be approved and current at their lifecycle boundaries; a changed, superseded, or content-drifted source blocks later delivery until it is reconciled and intentionally repinned. `contract_refs` are governed API or technical-design entries. Collaborative `shared_contract_refs` are coordination paths or surfaces and do not replace the governed reference.

Governance cannot be weakened in place after delivery begins. At Design, the specification mode and `spec_refs` IDs are fixed; at Build, the UI delivery mode and `ux_refs`, `ui_refs`, and `contract_refs` IDs are also fixed. `work-item configure` may repin the same ID only to its current approved revision. Stop and replan the Work Item before changing its governing contract identity or delivery mode.

Without `--spec-ref`, a new Work Item records `specification_mode: gate-evidence`. That lightweight path still requires named approved-scope and acceptance evidence at the Spec gate, but it does not claim index-based product-scope revision protection. Supporting indexed UX, UI, API, or technical contracts may still be attached and enforced. Use it deliberately for bounded low-risk or migrate-on-touch work; use `--spec-mode indexed` with at least one approved `--spec-ref` for maintained, multi-party, or long-lived product behavior.

For existing organizations, preserve trusted documents first and migrate only when ownership, consumers, and acceptance are clear. See [Product specification system](product-specifications.md) and [Enterprise document adoption](enterprise-document-adoption.md).

## 8. Create a work item

```bash
temple work-item create . \
  --title "Verify the bounded user outcome" \
  --scope "One local flow" \
  --scope "No production release" \
  --acceptance "The result is visible at runtime" \
  --acceptance "Independent QA reproduces the exact revision"
```

Temple allocates the next `WI-####`, resolves the current owner Position and Agent, appends an event, rebuilds status, and outputs a suggested Codex task title, for example:

```text
WI-0002 · Engineering Manager · Clara
```

The title is only a readable projection. The work item ID and subsequently registered thread ID are the actual identifiers.

In Collaborative mode the printed ID instead resembles `WI-20260829-A1B2C3D4E5`. Do not predict it; use the value returned by `work-item create`.

For parallel candidates, record the coordination contract and inspect every readiness check before a claim:

```bash
temple work-item configure . \
  --work-item WI-20260829-A1B2C3D4E5 \
  --parent WI-20260829-1111111111 \
  --depends-on WI-20260829-2222222222 \
  --agent-id agent-taylor \
  --discipline backend \
  --base-revision abc123 \
  --integration-owner agent-taylor \
  --shared-contract-ref docs/checkout-api.md \
  --contract-status stable \
  --parallel-mode parallel

temple parallel check . --work-item WI-20260829-A1B2C3D4E5

temple parallel plan . \
  --parent WI-20260829-1111111111 \
  --max-workers 3

temple work-item claim . \
  --work-item WI-20260829-A1B2C3D4E5 \
  --agent-id agent-taylor \
  --principal-id principal-alice \
  --base-revision abc123 \
  --branch alice/checkout-totals \
  --worktree /absolute/path/to/worktree
```

The example IDs and revision are placeholders. Complete the normal lifecycle gates until the Work Item's owner Position matches the planned Agent's membership; a Developer claim therefore occurs after transition to Build. `work-item configure --parallel-mode parallel` is rejected unless scope, acceptance, ownership, base revision, affected paths, dependencies, shared-contract state, overlaps, integration ownership, unresolved items, and Discipline eligibility all pass. An overlap resolution must name the exact conflicting Work Item ID.

`parallel plan` recursively selects the named parent's non-terminal descendants, places selected dependencies in later waves, keeps unresolved path conflicts out of the same wave, and limits each wave when `--max-workers` is present. Without `--parent` it evaluates every active Work Item; without `--max-workers` it leaves capacity to the runtime. Add `--no-write` for a read-only preview. The resulting `.ai-org/views/parallel-plan.json` is generated and source-fingerprinted. It creates no task or claim.

When implementation is already authorized, a runtime with concurrent workers should dispatch only the first wave of a fresh plan, then establish claims and register the real tasks. If the runtime cannot dispatch concurrently, execute that wave sequentially. The Integration Owner joins exact revisions, verification, and unresolved items, then rebuilds the plan before dependent work. Use `work-item release` at handoff, abandonment, or completion. See [Parallel orchestration](parallel-orchestration.md).

### Select UI design depth

Select one explicit Work Item value:

- `not-applicable`: no user-facing interface changes; do not attach `ui_refs`.
- `code-first`: no separate pre-implementation mockup; retain the brief, required-state coverage, and runtime visual review.
- `preview-first`: review a wireframe, code preview, prototype, partial Figma design, or equivalent artifact before full implementation.
- `design-led`: use an approved, versioned design source and implementation mapping.

For interface work, copy `.ai-org/templates/ui-design-brief.md` into a project-owned artifact location and record its rationale and evidence. Choose the lightest tool that satisfies the mode. Figma is optional. Preview-first and design-led require an approved `ui_ref`; any `ui_ref` requires an explicit mode. Code-first may begin without a UI source, but it still requires state coverage and runtime visual review. Record the mode-specific evidence with named `--satisfy` values: prebuild evidence is enforced before Build, and all `minimum_evidence` from `.ai-org/core/ui-design.json` is enforced before a `go` closeout. See [UI design responsibility and delivery modes](ui-design.md) and [UI interaction contracts](ui-interaction-contracts.md).

### Manage unresolved items

List unresolved items without changing canonical state:

```bash
temple work-item unresolved . --work-item WI-0002
```

Resolve an exact existing entry, add or merge a new entry, or do both atomically:

```bash
temple work-item unresolved . \
  --work-item WI-0002 \
  --resolve "API contract needs review" \
  --merge "Physical-device coverage remains pending"
```

Resolution uses exact normalized text and rejects a missing entry before writing. Repeated `--merge` values are deduplicated. The same text cannot be resolved and merged in one command.

### Pilot or example work item

If a work item exists only to validate the framework, workflow, architecture, or technical feasibility, its scope and acceptance criteria must also state:

- Experiment purpose: what this run must prove.
- Stop condition: which evidence means work should stop.
- Excluded follow-on work: which new features, second work item, distribution, or productization are not authorized.

A release-gate `go` accepts only the bounded experiment. After the stop condition is met, freeze the sample, write a retrospective, and return control to the Engineering Manager and user. Do not continue product development without a new explicit request. See [ADR-0011](adr/0011-pilot-stop-boundary.md).

## 9. Coordinate with an external tracker

Keep the company tracker, repository Work Items, and Codex tasks as separate layers. Configure no provider for repository-only work. When the company uses GitHub Issues:

```bash
temple tracker configure . \
  --tracker-profile linked-tracker \
  --sync-granularity team-visible \
  --provider-id github-main \
  --provider-kind github \
  --project owner/repository \
  --write-policy plan-only

temple tracker link . \
  --work-item WI-0001 \
  --provider-id github-main \
  --item-id 381 \
  --url https://github.com/owner/repository/issues/381

temple tracker inspect . --work-item WI-0001 --no-write --json
temple tracker plan . --work-item WI-0001 --no-write --json
```

Root Work Items default to `team-visible`; children default to `internal`. Keep AI-only implementation and verification slices internal unless another person or team must coordinate them. Jira and generic providers currently accept a normalized observation file rather than contacting the service directly:

```bash
temple tracker reconcile . \
  --work-item WI-0001 \
  --observation /absolute/path/to/observation.json \
  --resolution keep-temple \
  --reason "Repository lifecycle evidence remains incomplete"
```

The command records repository evidence and never writes externally. External completion cannot satisfy Temple lifecycle gates. See [Task and external tracker coordination](task-and-tracker-coordination.md) for profiles, field ownership, manual observation format, and company-team responsibilities.

## 10. Register a Codex task

The Temple CLI does not directly create Codex app tasks. After the user or Codex app creates a task, register its actual ID:

```bash
temple task register . \
  --work-item WI-0002 \
  --position developer \
  --thread-id 01example \
  --host-id local \
  --revision abc123
```

By default, `task register` attributes the registration action to the Engineering Manager. Use `--actor` to specify an Agent who holds that Position or `human`. By default, `task update` is performed by the task's Agent; the Engineering Manager and `human` may also update registry metadata. The task owner and the actor who performs registration are stored separately.

Update progress:

```bash
temple task update . --task-id task-0001 --status waiting --revision def456
temple task update . --task-id task-0001 --status completed --revision fedcba
temple task list .
```

Valid states are `setup`, `active`, `waiting`, `attention`, `completed`, and `archived`. When the work item is terminal and the task is completed, status reports archive-ready. Actual archiving still requires an explicit Codex app operation.

## 11. Handoff and transition

A handoff records a caller-supplied revision reference, completed work, evidence, and unresolved issues:

```bash
temple handoff . \
  --work-item WI-0002 \
  --to quality_evaluator \
  --input-revision fedcba \
  --completed "Implemented the accepted scope" \
  --evidence .ai-org/artifacts/WI-0002/developer-tests.md \
  --unresolved "Physical device remains out of scope"
```

A transition allows only edges defined in `.ai-org/core/workflow.json`. Every `requires` entry must be satisfied with a named evidence reference:

```bash
temple transition . \
  --work-item WI-0002 \
  --to design \
  --satisfy approved_scope=docs/spec.md \
  --satisfy acceptance_criteria=docs/spec.md
```

The CLI rejects the operation before writing if a requirement is missing, a state is skipped, or the actor does not hold the current Position. Phase 1 records revision references but does not yet resolve them as Git objects; exact Git-revision validation remains a Phase 2 evidence-adapter responsibility.

## 12. Release gate and closeout

`temple close` completes only organizational closeout. It does not deploy, publish, send external messages, or obtain high-risk approval:

```bash
temple close . \
  --work-item WI-0002 \
  --decision go \
  --tested-revision fedcba \
  --approval not-required \
  --rollback "Use git revert for the bounded candidate" \
  --satisfy accepted_scope=docs/spec.md \
  --satisfy test_evidence=.ai-org/artifacts/WI-0002/test.md \
  --satisfy evaluation_report=.ai-org/artifacts/WI-0002/evaluation.md \
  --satisfy independent_qa_report=.ai-org/artifacts/WI-0002/independent-qa.md
```

Use `--approval not-required` only when policies contain no production-change, external-message, irreversible-action, material-cost, or sensitive-data trigger. Otherwise, reference a human approval record.

`--decision no-go` requires at least one `--reason` and returns the work item to the Engineering Manager in the `blocked` state.

## 13. Observation and health checks

```bash
temple status .
temple status . --json --no-write
temple doctor .
```

`status.md` includes:

- Work-item state, owner, Agent, latest revision, evidence, and unresolved issues.
- Codex tasks and threads, suggested titles, status, revision, and archive readiness.
- Context Map route counts, default provider mode, and Capability Registry counts.
- Product-specification authority, approval, and source counts plus stale Work Item references.
- Engineering Learning Loop counts and the retrieval-index path.
- Blocked, attention, and archive-ready signals.
- The eight most recent canonical events.
- Position Assignments and optional-integration states.

## 14. Upgrade from an older version

```bash
temple upgrade /absolute/path/to/project --dry-run
temple upgrade /absolute/path/to/project
temple doctor /absolute/path/to/project
temple status /absolute/path/to/project
```

Upgrade rules:

- Validate every managed checksum against the old `temple.lock` first.
- Update only managed files that the project has not modified.
- A proposed new managed path must not already exist unless its exact path is already managed by the installed lock; byte-identical untracked files are not silently adopted.
- Preserve installed optional packs and update them to the current pack version. Upgrade does not enable an uninstalled pack automatically.
- Preserve `.ai-org/project/**`, `.ai-org/learning/**`, work items, events, decisions, artifacts, Agent names, and product files. If an older installation has no specification index, learning index, or Context Map, upgrade creates only the corresponding empty project-owned seed.
- Preserve an existing UI Designer Assignment. If an older project has none, assign UI Designer to its single active UX Designer Agent Identity; ambiguous Assignment state stops the migration.
- Detected preflight conflicts stop before writing. Late file races trigger a rollback journal; if another writer changes a just-written path again, the CLI preserves that content and reports incomplete rollback for manual review.

## 15. Use Decision, Domain, Documentation, Authoring, and Development Skills

- `$decision-interview`: Break an ambiguous idea into known facts, options, decisions, and unknowns. If repository documents, code, or Git state constrain the choice, the same Skill switches to evidence-backed mode and cites actual paths.
- `$domain-modeling`: Organize ubiquitous language, bounded contexts, rules, and invariants, then preserve confirmed terms in the project-owned glossary.
- `$project-documentation`: Create or update human-facing README, setup, usage, contribution, and documentation-index files from repository evidence. It checks commands, links, shipped claims, audience, and language policy without taking over Agent instructions or product specifications.
- `$skill-authoring`: Create, revise, or audit a repository-local reusable procedure with explicit routing, authority, dependencies, provenance, validation, and completion. It keeps project extensions project-owned and does not silently promote or distribute them.

Each Skill preserves the request's authority boundary. Inspection, classification, and proposals are read-only by default; a Skill may change only its declared target artifacts when the user or current work item explicitly authorizes that mutation. Otherwise, show the proposed target and contents. Selecting a Skill never authorizes unrelated implementation or external action.

`$tdd` and `$diagnosing-bugs` are available only when the Build Quality pack is installed. They improve development procedure but do not replace Positions, work-item gates, release authority, or Independent QA.

## 16. Troubleshooting

- `managed file changed`: Inspect the diff first. Do not bypass it by re-running init or editing the lock. A locked file cannot become a project extension merely by modifying it; restore or rename it through an explicit migration, or contribute the change back to the central framework.
- `missing gate evidence`: Add real evidence, then use `--satisfy requirement=reference`. Do not enter a fabricated path.
- `actor does not hold Position`: Return to Assignments and use the correct Agent and Position, or record an explicit human action.
- `agents_md_pending_merge`: Inspect `.ai-org/project/AGENTS.temple.md`, then obtain human approval for integration.
- `developer_qa_not_independent`: Change the Assignment so Developer and Independent QA use different `agent_id` values.
- `task registry` error: Confirm that the work item, Position, Agent, thread ID, and status all exist and are unique.
- `untracked file blocks optional pack`: The target Skill path already contains different content. Confirm ownership and provenance; do not let the pack overwrite it.
- `installed pack file changed`: Inspect the Skill diff. To retain custom content, do not remove or upgrade it. To return to the central version, explicitly resolve the difference first.
- `engineering_learning` error: Keep each Lesson or Practice path, ID, status, and index entry consistent; remove neither side without updating the other.
- `context_map` error: Correct unsafe or missing active route paths, unknown Positions, or malformed route metadata in `.ai-org/project/context-map.json`.
- `spec_index` error: Correct malformed IDs, authority/source mismatches, missing approval evidence, unsafe repository paths, or invalid source references in `.ai-org/project/spec-index.json`.
- Stale specification warning: Reconcile the governing document change, then intentionally repin the Work Item to the approved current revision; do not edit the revision merely to silence the warning.
- `capability_registry` error: Repair the named repository `SKILL.md` frontmatter or align its `name` with the containing directory. Do not add a project Skill to `temple.lock` merely to silence the error.
- Affected-path overlap warning: Coordinate the two non-terminal work items before editing shared paths. The warning is not an automatic cancellation or ownership transfer.
