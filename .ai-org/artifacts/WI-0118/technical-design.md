# Technical design — WI-0118

## Decision

Introduce a versioned workflow v2 contract and one shared lifecycle resolver. Keep old Work Items valid by normalizing missing fields to the Standard profile. Separate organization profile, Work Item workflow profile, and model advice.

## Managed contract

`project-overlay/.ai-org/core/workflow.json` becomes `temple.workflow/v2` and defines:

- terminal states including `concluded`;
- Standard and High-Assurance routes using the existing full transition graph;
- a Lean route `intake → build → test → done`;
- the profile order `lean < standard < high-assurance`;
- risk-tier, scope-class, and explicit escalation-trigger floors; and
- profile-specific gate requirements.

The installed self-host copy is updated through the normal managed-file upgrade path. A new workflow schema and the Work Item schema validate the contract and optional v2 fields without rewriting project-owned history.

## Work Item contract

New Work Items may record:

```json
{
  "workflow_profile": "lean | standard | high-assurance",
  "risk_tier": "low | standard | high | critical",
  "profile_assessment": {
    "requested_profile": "lean | standard | high-assurance",
    "effective_profile": "lean | standard | high-assurance",
    "scope_class": "bounded | ordinary | cross-system",
    "escalation_triggers": ["..."],
    "rationale": "...",
    "evidence_refs": ["..."],
    "evaluated_at": "..."
  },
  "lifecycle_outcome": "accepted | no-go | inconclusive | cancelled",
  "closeout_reasons": ["..."]
}
```

Missing profile data resolves to Standard, except an existing Work Item with an assurance object resolves to High-Assurance. Profile assessment is explicit input; no filename, title, or prose classifier is introduced. Before Build, a requested profile may be raised to the computed minimum. After Build, any stronger requirement blocks the Work Item for explicit replanning. Downgrades are rejected.

The create and configure CLI surfaces accept `--workflow-profile`, `--risk-tier`, `--scope-class`, repeatable `--escalation-trigger`, `--profile-rationale`, and repeatable `--profile-evidence`. Creation stores the requested and effective profile. Configuration may only preserve or raise it before Build.

## Shared lifecycle resolver

Add `src/workflow.mjs` to:

- normalize workflow v1 as a Standard-only compatibility graph;
- validate workflow v2 profile and escalation definitions;
- resolve effective and legacy-projected Work Item state;
- return the applicable transition and next Position;
- compute terminal status and lifecycle outcome; and
- map concluded outcomes for external consumers.

Status, context routing, orchestration, Observer, conditions, Codex task/provider eligibility, tracker projection, and usage calibration consume this resolver instead of independent `done`/`cancelled` lists.

## Lean gates

Lean `intake → build` requires the delivery brief to satisfy `work_order`, `approved_scope`, `acceptance_criteria`, `technical_design`, `risk_review`, and `profile_eligibility`. `build → test` retains developer handoff and developer evidence. `test → done` requires test evidence and `lean_closeout`. The transition records `lifecycle_outcome: accepted`, releases the claim, emits `work_item_closed`, and performs no external release.

Lean Test remains owned by Quality & Evaluation. Independent QA is not asserted or imitated. Any scope that requires Independent QA must be Standard or High-Assurance.

## No-go and inconclusive outcomes

Release Gate close behavior becomes:

- `go → done`, `lifecycle_outcome: accepted`;
- `no-go → concluded`, default `lifecycle_outcome: no-go`; and
- `no-go --outcome inconclusive → concluded`, `lifecycle_outcome: inconclusive`.

No-go reasons are stored in `closeout_reasons`, not added as new actionable unresolved work. Both decisions emit a close event and release active claims.

Legacy no-go records are normalized read-only as terminal when all structural predicates match: state blocked, previous state release_gate, release result no-go, no next Position, and retained release record. An explicit, idempotent `work-item migrate-outcomes` command performs the project-owned rewrite. `--dry-run` is the default safe inspection path; `--outcome inconclusive` is never inferred from prose.

## Human-facing projection

Observer Work Items expose canonical state, effective state, terminal flag, workflow profile, lifecycle outcome, closeout reasons, and whether a legacy terminal normalization occurred. Concluded items are excluded from current attention, active organization workload, stale-evidence alerts, and Agent command eligibility.

The Management Console moves concluded work to History and labels outcomes `Accepted`, `No-go`, `Inconclusive`, or `Cancelled`. `Blocked` remains reserved for actionable pauses. Work detail displays the workflow profile. The organization-level setting is labeled `Organization profile` to avoid profile ambiguity.

## Model guidance

No automatic router is added. The existing project-owned usage policy remains authoritative for this repository and distribution defaults remain provider-neutral. Documentation records the current advisory route and official source. Future dispatch continues to store requested and effective models separately.

## Benchmark boundary

The next multi-repository comparison is a separate live Work Item. WI-0118 adds only an executable specification and pure-local validator/fixtures if needed. Both arms use the same model route and frozen task inputs. The local rehearsal must reject invalid schemas, mismatched source revisions, missing seeded-defect detectability, unbalanced arm inputs, and mutable score contracts before generation.

## Integration sequence

1. Land workflow v2/schema and resolver with v1 normalization tests.
2. Add profile-aware create/configure/transition behavior and closeout semantics.
3. Replace duplicated terminal-state logic across projections and providers.
4. Add explicit legacy migration and migrate this repository's seven structurally qualified no-go items.
5. Update Console terminology and History behavior.
6. Add the retrospective and benchmark specification.
7. Run focused tests, full verification, detached Independent QA, and a real responsive Console review.
