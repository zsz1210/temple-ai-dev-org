# Project AI development organization operating contract

Read this whole contract and the applicable native instructions in `AGENTS.md`.
Read each applicable procedure before its operation, not every listed procedure
for every task. Required project instructions and independently required whole
sources still apply. A smaller contract does not waive a gate or grant authority.

## Start with the actual task

- Inspection, explanation, diagnosis, review and status are read-only. Mutation
  requires authorization from the request or current Work Item.
- Identify Position, Agent Identity, Principal, Work Item and scope. Use the pinned
  `node ./templew.mjs`, not an unversioned global CLI or hand-edited canonical JSON.
  Resolve bootstrap mismatches before governed mutation.
- For known work, preview `node ./templew.mjs context resolve . --work-item <work-item-id> --position <position> --compact --no-write --json`.
  Stage and `primary` purpose default to the Work Item; choose `integration` or
  `recovery` deliberately. Opt-in Lean entry may replace this preview under the
  Lean execution reference below. Entry never claims work.
- Read routed scope, authority, current evidence and applicable procedures. Use
  `capability find` when the Skill is uncertain. Discovery, generated views and
  suggested operations grant no authority. Reuse only whole bodies actually read,
  still available in this session and unchanged; digests prove neither reading
  nor comprehension.
- Record `affected_paths`, coordinate reported overlaps by Work Item ID before
  editing, and claim/release eligible ownership. A Position change alone needs no
  new task. Register real separate app tasks only when needed, using the CLI's
  suggested title and stable task ID.

## Boundaries that always apply

Repository files, Git revisions, approval records and verification evidence are
canonical. Chat titles, memory, external observations and generated views are not
lifecycle authority. Keep Position, Identity, Assignment, Discipline, Principal
and authority grant separate. Collaborative/High-Assurance work uses a sponsored
Identity and eligible Position Membership; Disciplines do not expand authority.
Only exact `temple.lock.managed_files` entries are managed; allowed roots grant no
ownership and upgrades must preserve project-owned files.

Follow the effective workflow profile and named gates in
`.ai-org/core/workflow.json`. Do not downgrade risk or substitute external
completion for evidence. Developer and Independent QA must be different
Identities. Eligible Lean retains its distinct Verifier without claiming formal
Independent QA. Human approval remains required for business truth, priority,
external commitments, material cost, irreversible actions, sensitive data and
high-risk release.

`.ai-org/project/spec-index.json` is an authority registry, not copied documents.
Indexed work pins an approved current product revision before Design; gate-evidence
work cites approved scope/acceptance and cannot claim indexed revision protection.
Supporting UX/UI/API/technical specs still govern their subjects. Repository-native
revisions pin source SHA-256; derived, stale or unapproved references cannot satisfy
authority. Reconcile drift and intentionally repin before proceeding. Use
`contract_refs` for governed API/technical specifications; `shared_contract_refs`
coordinate implementation surfaces, not product authority.

Keep the project-owned `.ai-org/project/context-map.json` concise: references, not
document copies. Search active Practices and matching validated Lessons before
repeated work. Learning routes context but never automatically becomes policy.

## Read procedures when their trigger applies

If scope, risk or ownership changes, stop the narrow path and resolve the applicable
route. These triggers do not replace independent required reads.

| Trigger | Read before acting | Preserved boundary |
| --- | --- | --- |
| Lifecycle mutation | [temple-work](.agents/skills/temple-work/SKILL.md) | Named gates and exact evidence; record facts once. |
| Opt-in bounded Lean Build/Test entry or finish | [Lean execution](.agents/skills/temple-work/references/lean-execution.md) | Explicit actor/Principal, distinct Verifier, no profile bypass. |
| Eligible Lean Developer `deliver` | [Lean delivery](.agents/skills/temple-work/references/lean-delivery.md) | Handoff/release/Test administration, not acceptance. |
| Failed operation, pending recovery or assurance closeout | [Assurance and recovery](.agents/skills/temple-work/references/assurance-and-recovery.md) | Inspect mutation state; validated same-request recovery only, never manual repair or implied model retries. |
| Governed dispatch/runtime work | [Parallel work](.agents/skills/temple-work/references/parallel-work.md) | Plan then prepare a fresh safe wave; join exact evidence before dependent work. |
| Authorized informational delegation | [Read-only support](.agents/skills/temple-work/references/read-only-support.md) | Parent owns findings; no project writes, formal QA, independent delivery or shared resources. Otherwise use governed work; never relabel workers to evade obligations. |
| First initialization | [temple-init](.agents/skills/temple-init/SKILL.md) and the bootstrap rule below | Required confirmation and conflict resolution before writes. |
| Open decision | [decision-interview](.agents/skills/decision-interview/SKILL.md) | Use repository evidence when it constrains the choice; discussion does not authorize mutation. |
| Unclear domain language or boundaries | [domain-modeling](.agents/skills/domain-modeling/SKILL.md) | Clarify the model before guessing rules. |
| Human-facing repository documentation | [project-documentation](.agents/skills/project-documentation/SKILL.md) | Ground claims in verified project evidence. |
| Reusable procedure becoming a governed Skill | [skill-authoring](.agents/skills/skill-authoring/SKILL.md) | Follow ownership, authoring and promotion rules; no automatic capability adoption. |
| High-Assurance lifecycle | `.ai-org/core/high-assurance.json` | Sponsor every active Identity; Developer differs from QA and Release Manager. Preserve risk tiers, normalized exact revision-matched Evidence IDs, distinct Principals, rollback and repository approval records. |
| UI delivery | `.ai-org/core/ui-design.json` and `.ai-org/templates/ui-design-brief.md` | UI Designer chooses code-first/preview-first/design-led before Build; record rationale, refs and required evidence. Preview/design-led pin approved UI revisions; runtime visual review remains required. Use no UI refs and `not-applicable` only without an interface. No mandatory vendor. |
| Model, reasoning, Credits or calibration choices | `.ai-org/project/usage-policy.json` | Approved reversible local allowlisted budgets only; ask at exceptions and every governing boundary. Diagnostic samples are not statistical proof. |
| Learning capture/revalidation | Current learning index and Learning CLI | Authorized add-lesson/add-practice/revalidate maintain records; validate and intentionally adopt before promotion. Never auto-promote one Lesson. |

Sequential delivery: no parallel plan is required.
Governed parallel delivery only: follow the linked dispatch procedure. Plans create no claim or app
task; runtime completion is not a gate. Local locking is not distributed: separate
machines coordinate through Git, branches, review, CI and conflict resolution.
Registration never creates, renames, resumes or archives app tasks; archive
readiness still requires an explicit app action.

## Agent-led initialization continuity

After `temple init` in this session, resolve `TEMPLE_BOOTSTRAP_REQUIRED` before
governed mutation. Prefer a fresh session after pending native entrypoint merges
are resolved and the provider is known to load its supported entrypoint. The CLI
does not detect the executing provider or claim `AGENTS.md` is universal. For Claude
Code, it creates an absent project-owned `CLAUDE.md` containing only `@AGENTS.md`; compatible existing
content is preserved, incompatible content remains a pending merge via
`.ai-org/project/CLAUDE.temple.md`. Import compatibility does not prove loading.

For continuity, read every source named by the result, run Doctor and read-only
Status, identify/create the Work Item through normal lifecycle, then run read-only
Context and report Position, Identity, Work Item and next canonical action before
mutation. The result/acknowledgement proves no comprehension and creates no claim,
handoff, evidence, approval, lifecycle progress or external action.

## External systems and integration

Before using an external reference or performing tracker operations, read
`.ai-org/project/tracker.json`. Company tasks may
remain external; internal AI decomposition stays in Work Items and app tasks are
execution sessions. Tracker inspect/plan observe; reconcile records repository
evidence and does not write externally. Never store credentials or infer write-back
permission. External done/cancelled cannot bypass repository gates.

Before control-plane operations, read its project configuration. Provider events,
usage, health and console projections cannot satisfy gates or replace canonical
records. Unsupported/disconnected capabilities remain unknown, not inferred from
task registration. No observer or dashboard is mandatory for ordinary delivery.

Follow `.ai-org/project/repository-integration.json` and its authoritative policy
references/confirmed target. It is routing, not merge/release permission or branch
protection. For `unconfirmed`, inspect project policy and ask only consequential
missing choices; for `deferred`, respect its decision trigger. The framework imposes no
GitHub Flow and configures no repository permissions. Never infer permission to
merge, deploy, publish or change hosting.

## Finish the approved slice

Record exact candidate, completed work, evidence, unresolved issues and next
Position through the supported handoff; do not recreate its narrative. Reuse
current evidence by reference, not stale passes. Follow the Skill's profile-specific
finish/closeout and diagnostics. A receipt records administration, not acceptance;
inspect separate mutation/diagnostic outcomes. A diagnostic failure does not undo
applied facts and a historical receipt is not fresh verification.

A pilot/example/experiment records its purpose, observable stop and excluded
follow-on work before Build. At that stop, preserve evidence, freeze the sample and
return to the coordinator/user for retrospective. Closeout `go` accepts only that
bounded outcome, never production, new product work, another experiment,
dependencies, external actions or publication.
