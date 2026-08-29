# Usage guide

## 1. Install the central toolkit

```bash
git clone git@github.com:zsz1210/temple-ai-dev-org.git
cd temple-ai-dev-org
npm run verify
# Optional: expose the local CLI as `temple`
npm link
temple --version
```

Clone the central toolkit once. Install it into each product repository with `temple init`; no fork is required. `project-overlay/` is only the installation source inside the central repository. Its contents are installed directly at the product repository root.

## 2. First initialization

### Recommended: use Codex assistance

For the first run, open Codex in the central toolkit repository and provide the absolute path to the target repository:

> Use temple-init with `/absolute/path/to/target`. Suggest English names for the five Assignment slots, wait for my confirmation, and then initialize the project.

The AI must display Position mappings and proposed names first. It may create the configuration and run `init` only after confirmation. After installation, the target repository receives `$temple-init`, `$temple-work`, `$decision-interview`, `$domain-modeling`, and `$project-documentation`. The central repository itself contains no default names.

### Manual configuration

Create a JSON file that does not need to be committed to Git:

```json
{
  "schema_version": "temple.init/v1",
  "project": { "id": "product-id", "name": "Product Name" },
  "naming_mode": "manual",
  "agents": [
    { "display_name": "Name One", "positions": ["engineering_manager", "release_manager", "observer"] },
    { "display_name": "Name Two", "positions": ["product_manager", "ux_designer"] },
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

## 4. Create a work item

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

If a work item exists only to validate the toolkit, workflow, architecture, or technical feasibility, its scope and acceptance criteria must also state:

- Experiment purpose: what this run must prove.
- Stop condition: which evidence means work should stop.
- Excluded follow-on work: which new features, second work item, distribution, or productization are not authorized.

A release-gate `go` accepts only the bounded experiment. After the stop condition is met, freeze the sample, write a retrospective, and return control to the Engineering Manager and user. Do not continue product development without a new explicit request. See [ADR-0011](adr/0011-pilot-stop-boundary.md).

## 5. Register a Codex task

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

## 6. Handoff and transition

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

## 7. Release gate and closeout

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

## 8. Observation and health checks

```bash
temple status .
temple status . --json --no-write
temple doctor .
```

`status.md` includes:

- Work-item state, owner, Agent, latest revision, evidence, and unresolved issues.
- Codex tasks and threads, suggested titles, status, revision, and archive readiness.
- Blocked, attention, and archive-ready signals.
- The eight most recent canonical events.
- Position Assignments and optional-integration states.

## 9. Upgrade from an older version

```bash
temple upgrade /absolute/path/to/project --dry-run
temple upgrade /absolute/path/to/project
temple doctor /absolute/path/to/project
temple status /absolute/path/to/project
```

Upgrade rules:

- Validate every managed checksum against the old `temple.lock` first.
- Update only managed files that the project has not modified.
- A new managed path must not exist or must already match the central content.
- Preserve installed optional packs and update them to the current pack version. Upgrade does not enable an uninstalled pack automatically.
- Preserve `.ai-org/project/**`, work items, events, decisions, artifacts, Agent names, and product files.
- Any conflict stops before writing; no partial upgrade occurs.

## 10. Use Decision, Domain, Documentation, and Development Skills

- `$decision-interview`: Break an ambiguous idea into known facts, options, decisions, and unknowns. If repository documents, code, or Git state constrain the choice, the same Skill switches to evidence-backed mode and cites actual paths.
- `$domain-modeling`: Organize ubiquitous language, bounded contexts, rules, and invariants, then preserve confirmed terms in the project-owned glossary.
- `$project-documentation`: Create or update human-facing README, setup, usage, contribution, and documentation-index files from repository evidence. It checks commands, links, shipped claims, audience, and language policy without taking over Agent instructions or product specifications.

These Skills are read-only by default. Write confirmed decisions or glossary entries to files only when the user requests it or when the currently authorized work item includes repository updates. Otherwise, show the proposed target and contents. They do not start implementation by themselves.

`$tdd` and `$diagnosing-bugs` are available only when the Build Quality pack is installed. They improve development procedure but do not replace Positions, work-item gates, release authority, or Independent QA.

## 11. Troubleshooting

- `managed file changed`: Inspect the diff first. Do not bypass it by re-running init or editing the lock. Decide whether to retain it as a project extension or contribute the change back to the central toolkit.
- `missing gate evidence`: Add real evidence, then use `--satisfy requirement=reference`. Do not enter a fabricated path.
- `actor does not hold Position`: Return to Assignments and use the correct Agent and Position, or record an explicit human action.
- `agents_md_pending_merge`: Inspect `.ai-org/project/AGENTS.temple.md`, then obtain human approval for integration.
- `developer_qa_not_independent`: Change the Assignment so Developer and Independent QA use different `agent_id` values.
- `task registry` error: Confirm that the work item, Position, Agent, thread ID, and status all exist and are unique.
- `untracked file blocks optional pack`: The target Skill path already contains different content. Confirm ownership and provenance; do not let the pack overwrite it.
- `installed pack file changed`: Inspect the Skill diff. To retain custom content, do not remove or upgrade it. To return to the central version, explicitly resolve the difference first.
