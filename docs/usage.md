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

## 7. Create a work item

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

### Select UI design depth

When the work has a user interface, copy `.ai-org/templates/ui-design-brief.md` into a project-owned artifact location, reference the work item, and choose one mode:

- `code-first`: no separate pre-implementation mockup; retain the brief, required-state coverage, and runtime visual review.
- `preview-first`: review a wireframe, code preview, prototype, partial Figma design, or equivalent artifact before full implementation.
- `design-led`: use an approved, versioned design source and implementation mapping.

Choose the lightest tool that satisfies the mode. Figma is optional. Record the artifact path or URL, revision, approval when required, accessibility and device states, and runtime comparison evidence. See [UI design responsibility and delivery modes](ui-design.md).

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

## 8. Register a Codex task

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

## 9. Handoff and transition

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

## 10. Release gate and closeout

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

## 11. Observation and health checks

```bash
temple status .
temple status . --json --no-write
temple doctor .
```

`status.md` includes:

- Work-item state, owner, Agent, latest revision, evidence, and unresolved issues.
- Codex tasks and threads, suggested titles, status, revision, and archive readiness.
- Context Map route counts, default provider mode, and Capability Registry counts.
- Engineering Learning Loop counts and the retrieval-index path.
- Blocked, attention, and archive-ready signals.
- The eight most recent canonical events.
- Position Assignments and optional-integration states.

## 12. Upgrade from an older version

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
- Preserve `.ai-org/project/**`, `.ai-org/learning/**`, work items, events, decisions, artifacts, Agent names, and product files. If an older installation has no learning index or Context Map, upgrade creates only the corresponding empty project-owned seed.
- Preserve an existing UI Designer Assignment. If an older project has none, assign UI Designer to its single active UX Designer Agent Identity; ambiguous Assignment state stops the migration.
- Detected preflight conflicts stop before writing. Late file races trigger a rollback journal; if another writer changes a just-written path again, the CLI preserves that content and reports incomplete rollback for manual review.

## 13. Use Decision, Domain, Documentation, Authoring, and Development Skills

- `$decision-interview`: Break an ambiguous idea into known facts, options, decisions, and unknowns. If repository documents, code, or Git state constrain the choice, the same Skill switches to evidence-backed mode and cites actual paths.
- `$domain-modeling`: Organize ubiquitous language, bounded contexts, rules, and invariants, then preserve confirmed terms in the project-owned glossary.
- `$project-documentation`: Create or update human-facing README, setup, usage, contribution, and documentation-index files from repository evidence. It checks commands, links, shipped claims, audience, and language policy without taking over Agent instructions or product specifications.
- `$skill-authoring`: Create, revise, or audit a repository-local reusable procedure with explicit routing, authority, dependencies, provenance, validation, and completion. It keeps project extensions project-owned and does not silently promote or distribute them.

Each Skill preserves the request's authority boundary. Inspection, classification, and proposals are read-only by default; a Skill may change only its declared target artifacts when the user or current work item explicitly authorizes that mutation. Otherwise, show the proposed target and contents. Selecting a Skill never authorizes unrelated implementation or external action.

`$tdd` and `$diagnosing-bugs` are available only when the Build Quality pack is installed. They improve development procedure but do not replace Positions, work-item gates, release authority, or Independent QA.

## 14. Troubleshooting

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
- `capability_registry` error: Repair the named repository `SKILL.md` frontmatter or align its `name` with the containing directory. Do not add a project Skill to `temple.lock` merely to silence the error.
- Affected-path overlap warning: Coordinate the two non-terminal work items before editing shared paths. The warning is not an automatic cancellation or ownership transfer.
