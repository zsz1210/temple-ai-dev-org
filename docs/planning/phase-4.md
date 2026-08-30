# Phase 4: reliability at daily and multi-project scale

- Status: implementation in progress; Alpha.25 adds the Phase 4B evaluation and usage-attribution foundation, while longitudinal evidence, rollback, retention/audit export, real interruption, federation, and broader environments remain open
- Entry baseline: `0.1.0-alpha.23`
- Governing Work Item: `WI-0006`
- Recovery validation Work Item: `WI-0008`

Phase 4 turns Temple's locally proven organization model into a system that can survive failure, expose policy mistakes, and coordinate several authoritative repositories. It is an evidence phase, not a promise that adding more features makes Temple enterprise-ready.

## Design boundaries

Phase 4 preserves four different kinds of state:

| State | Authority | Phase 4 rule |
|---|---|---|
| Project-owned canonical files | The individual project repository | Back up, restore, migrate, and validate without silent overwrite |
| Runtime telemetry | The local provider and replay journal | Rebuildable observation; never satisfies a lifecycle gate |
| Portfolio projection | The project-owned coordination surface | Read-only aggregation; never advances a service Work Item |
| External systems | Their configured human or provider owner | No inferred write, spending, deployment, or approval authority |

The accepted decisions are:

- [ADR-0031](../adr/0031-durable-recovery-before-persistence-growth.md): prove durable recovery before expanding persistence.
- [ADR-0032](../adr/0032-evaluate-policy-with-adversarial-evidence.md): evaluate policy with adversarial evidence rather than happy-path test counts.
- [ADR-0033](../adr/0033-federate-project-authority-with-read-only-portfolios.md): federate project authority through composite references and read-only projections.
- [ADR-0034](../adr/0034-attribute-usage-before-routing-models.md): attribute usage and evaluate outcomes before automatically routing models.

## Phase 4A — durability and recovery

### Deliver

- A versioned backup manifest covering canonical `.ai-org/` state and declared project-owned artifacts.
- Content digests, source revision, Temple version, project ID, and explicit inclusions and exclusions.
- Restore preview, compatibility validation, conflict refusal, and atomic application where supported.
- Replay and command-ledger recovery that distinguishes a completed mutation from an interrupted one.
- Migration rehearsal and rollback against a data-bearing project copy.
- Retention and audit-export rules that reapply secret redaction at every boundary.

Generated views are rebuilt after restore. Runtime telemetry is exported separately and is not required to recover canonical project truth.

Alpha.24 implements the local versioned manifest, integrity inspection, stale-safe restore preview, explicit replacement consent, external recovery ledger, automatic rollback, and guarded interrupted-restore recovery. The [AiPet recovery rehearsal](../validation/alpha-24-aipet-recovery.md) restored all 21 included organization-state files into an isolated clean checkout, rejected a stale plan, upgraded the restored project from Alpha.5 to Alpha.24, and passed Doctor without changing the primary AiPet worktree. That closes one real-project restore and one forward-migration evidence gap; it does not close Phase 4A because post-upgrade rollback, retention/audit export policy, real interruption boundaries, and broader environments remain unverified.

### Exit evidence

- Restore one real data-bearing project into a clean environment.
- Reproduce the same canonical digests and pass Doctor after regeneration.
- Inject failure at meaningful write boundaries and prove that recovery neither duplicates a mutation nor overwrites project-owned data.
- Exercise one forward migration and one rollback with documented stop conditions.

Current evidence: one forward migration passed in the AiPet rehearsal; the rollback half of this requirement remains open.

## Phase 4B — policy, evaluation, and daily reliability

### Deliver

- A versioned adversarial scenario catalog for false completion, wrong revision, self-approval, unauthorized external action, stale scope, context loss, and noisy notification behavior.
- A scorecard that measures refusal or escalation correctness, gate integrity, recovery quality, rework, and Human Inbox handling.
- Historical operational measures for duplicate scope, blocked time, handoff recovery, stale evidence, retries, and accepted outcomes.
- Token Efficiency and Model Routing observation described in the [operations contract](../operations/token-efficiency-and-model-routing.md).

### Exit evidence

- Run the suite against representative Solo, Collaborative, and High-Assurance fixtures.
- Complete at least ten real Work Items across different task shapes without using chat history as authority.
- Demonstrate that a budget warning or model recommendation cannot skip required context, evidence, Independent QA, or human approval.
- Establish a baseline before claiming any reduction in Token usage, cost, elapsed time, or rework.

Alpha.25 implements the managed seven-scenario catalog, fail-closed `evaluation run` scorecard, Solo/Collaborative/High-Assurance deterministic fixtures, provider usage attribution, and `usage report` baseline view. Fixture evidence proves the evaluator and policy contract, not the real-operation exit gate. The ten real Work Items, varied task shapes, longitudinal comparison, and live organizational exercises remain open.

## Phase 4C — multi-repository federation

### Deliver

- A project-owned registry of participating repositories and their immutable project IDs.
- Composite references such as `project_id + work_item_id` for cross-project identity.
- Versioned cross-service Initiative, dependency, API, event-contract, and rollout references.
- A read-only portfolio that aggregates bounded status, capacity, shared-resource, evidence, risk, and usage signals.
- Compatibility and rollout waves for cross-repository changes; no assumed atomic multi-repository commit.

Every repository keeps its own `.ai-org/` lifecycle authority, credentials, Human Principals, evidence, and release decision.

### Exit evidence

- Run the retained multi-human, multi-machine, separate-clone validation with branches, pull requests, protected rules, CI, conflicts, and an Integration Owner.
- Prove that a stale or unavailable repository becomes `unknown` rather than falsely complete.
- Prove that the portfolio cannot mutate a local lifecycle or copy credentials and business truth into the coordination repository.
- Exercise an incompatible contract change through explicit compatibility and rollout waves.

## Token and model-routing maturity

Phase 4 progresses in controlled steps:

1. **Observe:** retain provider-reported usage and effective model configuration with bounded correlation metadata.
2. **Explain:** report high-usage Work Items, stages, retries, context loads, and cache behavior without assigning fault from Token count alone.
3. **Recommend:** compare eligible model and reasoning configurations against representative task results.
4. **Route with consent:** allow explicit project policy and human overrides within configured capability, privacy, and spending boundaries.

Automatic adaptive routing, autonomous price selection, and organization-wide spending authority are not Phase 4 defaults.

## Retained validations

The following remain visible until executed in the named environment:

- long-duration control-plane soak, large-journal performance, disconnect, and crash-at-write-boundary tests;
- large-repository deterministic retrieval and any configured local-hybrid or RAG provider;
- broader operating-system support beyond the published matrix;
- regulated audit acceptance and production release operation;
- statistically meaningful Token and cost comparisons across representative real projects.

## Stop condition

Phase 4 is complete only when the exit evidence is reproducible across repeated real use. A schema, dashboard, model selector, or successful local fixture does not close the phase by itself.
