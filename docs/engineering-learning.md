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
└── practices/
    └── PRACTICE-0001.md
```

The initialized project includes an empty `index.json`. Record templates are available in `.ai-org/templates/lesson.md` and `.ai-org/templates/practice.md`; the record directories are created only when the project has something authorized to preserve.

The machine-readable contract is `.ai-org/core/schemas/learning-index.schema.json`. `temple doctor` additionally checks ID-kind-path agreement, kind-specific states, duplicate IDs and paths, date values, and whether every indexed Markdown record exists and every record is indexed.

### What `index.json` contains

The index is a compact retrieval registry, not a copy of every record. Each entry contains:

- ID, kind, title, and one-sentence summary;
- status and confidence;
- tags and `applies_to` hints;
- source work-item IDs;
- the record path;
- update and last-validation dates;
- proposed or accepted promotion target.

An Agent should search the index first, select entries relevant to the current Position, work item, and technical area, then read only the referenced records. It must not load the whole learning history into every task.

## Loop stages

1. **Observe:** preserve facts, outcome, environment, revision, and evidence from a work item or retrospective.
2. **Capture:** write the smallest supported Lesson. Separate observation from interpretation and uncertainty.
3. **Validate:** reproduce it, find counterexamples, narrow applicability, and change confidence. One incident rarely supports a universal rule.
4. **Apply:** convert a validated Lesson into an active Practice only when the project intentionally adopts the guidance.
5. **Promote:** choose the correct destination. Use a Skill for a reusable decision procedure, an automated check for a deterministic condition, an ADR for a decision, or an instruction for an approved always-on rule.
6. **Revalidate:** revisit the Practice after relevant technology, architecture, policy, or evidence changes. Deprecate it when it no longer holds.

Promotion is optional. A valuable Lesson may remain a Lesson, and a simple Practice may never need a Skill.

## Responsibility

- Any Position may propose a Lesson from evidence in its authorized work.
- The Engineering Manager triages duplicates, missing evidence, ownership, and follow-up.
- The Tech Lead validates technical Practices and decides whether a deterministic check, ADR, or Skill proposal is appropriate.
- Quality & Evaluation and Independent QA may challenge generalization and add counterexamples.
- The Observer surfaces counts, candidate Lessons, active Practices, stale validation, and contradictions without approving them.
- Humans approve cross-project sharing, recurring instructions, and promotion into the central framework.

## Privacy and cross-project learning

Project learning never flows into the central framework automatically. A framework-level candidate requires explicit human approval, removal of private product information, provenance review, and repeated evidence from more than one bounded case. Open-source Temple must not expose a private pilot's code, data, or identifying evidence.

## Current alpha boundary

The current alpha installs the project-owned index, managed templates, doctor validation, and status counts. It does not yet provide `temple learning` commands, automatic retrospective execution, semantic retrieval, stale-practice alerts, cross-project synchronization, or a `$retrospective` Skill. Until real use validates the procedure, authorized updates must keep the Markdown record and index entry consistent manually.
