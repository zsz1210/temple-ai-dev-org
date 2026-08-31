# Engineering Learning Loop

The Engineering Learning Loop is the framework's evidence-to-improvement system. It prevents a useful discovery from disappearing inside one conversation while also preventing every retrospective note from becoming a permanent instruction or Skill.

```text
Work evidence
  → Retrospective observation
  → Lesson
  → Validation
  → Practice or Guardrail
  → Skill, automated check, ADR, instruction, or no promotion
  → Revalidation or deprecation
```

## The artifacts are different

| Artifact | Purpose | Authority |
|---|---|---|
| Retrospective | Review one bounded body of work | May propose learning; does not create a rule by itself |
| Lesson | Preserve the smallest evidence-supported conclusion | Informational until validated or promoted |
| Practice or Guardrail | State adopted guidance with an explicit scope | Guides relevant work; does not grant permission or replace a gate |
| Skill | Execute a reusable, non-obvious decision procedure | Operates only inside the request and Position authority |
| Automated check | Enforce a deterministic condition | Reports or blocks only as configured |
| ADR | Preserve an important technical or organizational decision | Governs its declared decision scope |
| Instruction | Apply an always-on repository rule | Requires explicit approval because it affects recurring behavior |

The middle layer is **Practice**. It is stronger than a note because it has evidence, applicability, status, and an owner. It is lighter than a Skill because it does not define a full reusable procedure.

## Repository model

Learning is project-owned canonical state:

```text
.ai-org/learning/
├── index.json
├── lessons/
│   └── LESSON-0001.md
├── practices/
│   └── PRACTICE-0001.md
└── proposals/
    └── SKILL-PROPOSAL-0001.json
```

The initialized project includes an empty v2 `index.json`. Record templates are available in `.ai-org/templates/lesson.md` and `.ai-org/templates/practice.md`; the record directories are created only when the project has something authorized to preserve.

The machine-readable contract is `.ai-org/core/schemas/learning-index.schema.json`. `temple doctor` additionally checks ID-kind-path agreement, kind-specific states, duplicate IDs and paths, date values, and whether every indexed Markdown record exists and every record is indexed.

### What `index.json` contains

The index is a compact retrieval registry, not a copy of every record. Each entry contains:

- ID, kind, title, and one-sentence summary;
- status and confidence;
- tags and `applies_to` hints;
- source work-item IDs;
- Lesson derivation and the owning Position for a Practice;
- the record path;
- update, last-validation, next-review, and revalidation-history fields;
- revalidation evidence and confirmed, narrowed, or contradicted result;
- promotion target, proposal reference, human-decision status, review date, and authoring Work Item link.

An Agent should search the index first, select entries relevant to the current Position, work item, and technical area, then read only the referenced records. It must not load the whole learning history into every task.

## Loop stages

1. **Observe:** preserve facts, outcome, environment, revision, and evidence from a work item or retrospective.
2. **Capture:** write the smallest supported Lesson. Separate observation from interpretation and uncertainty.
3. **Validate:** reproduce it, find counterexamples, narrow applicability, and change confidence. One incident rarely supports a universal rule.
4. **Apply:** convert a validated Lesson into an active Practice only when the project intentionally adopts the guidance.
5. **Promote:** choose the correct destination. Use a Skill for a reusable decision procedure, an automated check for a deterministic condition, an ADR for a decision, or an instruction for an approved always-on rule.
6. **Revalidate:** revisit the Practice after relevant technology, architecture, policy, or evidence changes. Deprecate it when it no longer holds.

Promotion is optional. A valuable Lesson may remain a Lesson, and a simple Practice may never need a Skill.

### Skill promotion boundary

Temple detects a Skill candidate only when one Practice is active, has high confidence, has a confirmed revalidation result, and traces to at least two distinct Work Items. This is a deterministic triage threshold, not proof that a Skill should exist.

An eligible Practice may become a `SKILL-PROPOSAL-*` record. The proposal preserves the trigger, neighboring non-trigger, authority, risk class, dependencies, alternatives, overlap review, and evidence provenance. Observer and status surface eligible candidates, pending proposals, and deferred proposals whose review date has arrived.

A Human Principal must still choose `approve`, `reject`, or `defer`. Approval creates exactly one internal authoring Work Item scoped to the proposed `.agents/skills/<name>/` path. It does not write `SKILL.md`, activate a Skill, install a dependency, publish a pack, change a lifecycle gate, or perform the proposed procedure. Risk changes the validation depth of the later authoring work; low risk does not remove the approval boundary.

## CLI workflow

Use the CLI instead of hand-editing both files when possible:

```bash
node ./templew.mjs learning add-lesson . \
  --title "Bind runtime evidence to a revision" \
  --summary "Runtime evidence is reusable only with its exact revision." \
  --confidence medium \
  --tag runtime \
  --applies-to independent-qa

node ./templew.mjs learning add-practice . \
  --title "Revision-bound runtime evidence" \
  --summary "Record an exact revision for every runtime claim." \
  --confidence medium \
  --derived-from LESSON-0001 \
  --owner-position tech_lead

node ./templew.mjs learning revalidate . \
  --learning-id PRACTICE-0001 \
  --result confirmed \
  --review-after 2026-12-01T00:00:00.000Z

node ./templew.mjs learning list . --json

node ./templew.mjs learning skill-candidates . --json

node ./templew.mjs learning propose-skill . \
  --learning-id PRACTICE-0001 \
  --work-item WI-0042 \
  --skill-name revision-bound-runtime-check \
  --summary "Preserve revision-bound runtime verification as a reusable procedure." \
  --trigger "Use when runtime evidence must support a repository claim." \
  --non-trigger "Do not use to approve a release or perform an external action." \
  --authority "Guidance only; no lifecycle or release authority." \
  --risk-class medium \
  --overlap-review "No existing Skill has this exact routing boundary."

node ./templew.mjs learning decide-skill . \
  --proposal-id SKILL-PROPOSAL-0001 \
  --decision approve \
  --principal-id human \
  --reason "The evidence and routing boundary are sufficient."
```

`learning migrate --dry-run` reports whether a legacy v1 index would change; remove `--dry-run` for the explicit atomic v2 migration. Revalidation records history in both the index and Markdown record. Due, overdue, and contradicted entries appear in status or Observer attention; they do not rewrite guidance automatically.

`learning evaluate --fixture <repository-path> --no-write --json` runs checked-in retrieval cases and reports hit rate at the case limit plus mean reciprocal rank. Evaluation measures routing; it does not validate the truth of the returned learning.

## Responsibility

- Any Position may propose a Lesson from evidence in its authorized work.
- The Engineering Manager triages duplicates, missing evidence, ownership, and follow-up.
- The Tech Lead validates technical Practices and may create an evidence-backed Skill Proposal from an eligible candidate while holding the Design-stage claim.
- Quality & Evaluation and Independent QA may challenge generalization and add counterexamples.
- The Observer surfaces counts, candidate Lessons, active Practices, stale validation, contradictions, Skill candidates, and proposal decisions that need attention without approving them.
- Human Principals approve, reject, or defer project Skill authoring and approve cross-project sharing, recurring instructions, and promotion into the central framework.

## Privacy and cross-project learning

Project learning never flows into the central framework automatically. A framework-level candidate requires explicit human approval, removal of private product information, provenance review, and repeated evidence from more than one bounded case. Open-source Temple must not expose a private pilot's code, data, or identifying evidence.

## Current alpha boundary

Alpha.27 installs the project-owned index, managed templates, atomic Learning CLI, explicit migration, revalidation signals, deterministic retrieval evaluation, candidate detection, evidence-backed Skill Proposals, Human Principal decisions, idempotent authoring Work Item creation, doctor validation, and status/Observer attention. It does not execute retrospectives on a schedule, write or activate a Skill automatically, synchronize projects, install or select a semantic runtime, or provide a `$retrospective` Skill. Large-repository retrieval evaluation remains `not_run`.
