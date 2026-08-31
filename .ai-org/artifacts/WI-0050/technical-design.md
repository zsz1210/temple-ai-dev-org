# Technical design: Temple effectiveness and multi-repository validation

## Design status

- Deliverable: execution-ready plan, not experiment execution
- UI delivery mode: `not-applicable`
- Parallel mode for this planning Work Item: `sequential`
- Later experiment: parallel only after exact contracts, claims, affected paths, resources, and integration ownership pass `parallel check`

## Invariants

1. Each repository has an immutable project ID and owns its own `.ai-org/` lifecycle, approvals, claims, evidence, tasks, and releases.
2. A coordinator may own cross-service Initiatives, domain maps, contract indexes, experiment records, and read-only participant projections. It may not mutate participant lifecycle state.
3. Cross-repository references are composite and revisioned. A bare `WI-####`, branch name, or chat title is insufficient.
4. Missing, dirty, stale, invalid, identity-mismatched, or unreachable participant state resolves to `unknown`.
5. One repository owns each API or event contract. Consumers pin its approved version or exact revision.
6. A generated plan is not a claim, worker, Codex task, or authorization. Runtime preparation precedes task creation and stable task registration.
7. Developer and Independent QA remain different Agent Identities on the exact accepted candidate.
8. Numeric telemetry never grants lifecycle, model-routing, spending, release, or external-write authority.

## Repository topology

The later local experiment uses one non-repository container directory with four sibling Git repositories:

```text
temple-effectiveness-lab/
├── coordinator/       # Initiative, domain map, protocol, contract index, read-only portfolio
├── catalog/           # Product and availability authority
├── orders/            # Order creation and order-state authority
└── notifications/     # Order-event consumption and delivery authority
```

The coordinator participant registry stores an approved local path, immutable participant project ID, source provenance, refresh state, and exact candidate revision. It does not copy participant credentials, principals, claims, artifact bodies, prompts, approvals, or release decisions.

## Synthetic domain and contracts

| Contract | Owner | Consumers | Experiment use |
|---|---|---|---|
| Product Availability API v1 | Catalog | Orders | Establish a stable producer/consumer boundary. |
| Product Availability API v2 | Catalog | Orders | Introduce a deliberately incompatible field change and require a consumer-first compatibility wave. |
| `OrderPlaced` event v1 | Orders | Notifications | Exercise an event contract and independent consumer delivery. |
| Notification delivery result | Notifications | Coordinator summary only | Prove that the portfolio links to an outcome without taking service authority. |

The planned v2 change replaces a binary availability field with a status plus reservation expiry. The exact payload is finalized in the execution specification. The coordinator may index both versions and rollout order, but Catalog remains the contract owner.

## Execution phases

### Phase 0 — reviewed plan

`WI-0050` completes repository verification and Independent QA of this design. It stops at `release_gate` without closing, releasing, or creating experiment resources.

Exit condition: the human owner either revises the plan, declines it, or explicitly authorizes a new execution parent.

### Phase 1 — instrumentation feasibility

Create one safe synthetic Work Item and one real registered Codex task under an approved local experiment repository. Confirm:

- stable thread ID registration;
- exact Work Item/task/Position correlation;
- task current revision and observation revision equality;
- provider model and total-Token fields, or a precise unsupported/unknown result;
- no prompt or source-body retention;
- separate measurement-overhead timing.

Exit condition: mark the path `observed`, `partial`, or `unavailable`. An unavailable result stops Token qualification but does not invalidate non-Token federation testing.

### Phase 2 — local federation foundation

Initialize the four approved local repositories, create synthetic specifications, assign new project-local Agent identities during each `temple init`, establish participant references, and build the first read-only portfolio. No GitHub remote is required.

Exit condition: all repositories are clean, uniquely identified, pinned to exact revisions, and independently authoritative; privacy-filter tests pass.

### Phase 3 — varied Work Item rehearsal

Execute the planned work matrix, contract rollout, safe parallel waves, failure injections, exact-revision integration, cold-task recovery, and Independent QA. At least ten Work Items must reach accepted completion with correctly registered tasks; Token qualification additionally requires the fields enforced by Alpha.27.

Exit condition: publish only a local validation record with passed, failed, and unknown outcomes. Do not infer causal savings.

### Phase 4 — matched effectiveness evaluation

After Phase 3 reveals variance and instrumentation coverage, pre-register paired synthetic tasks, allocation order, model/reasoning controls, smallest meaningful effect, sample size, budget, and stopping rules. Compare Temple-assisted and baseline workflows without changing the rubric after results are visible.

Exit condition: report effect size, dispersion or interval, defects, rework, intervention, and limitations. The claim applies only to the tested tasks and configuration.

### Phase 5 — optional collaborative qualification

Only after separate approval, extend to multiple Human Principals, independently administered machines, private Git hosting, protected branches, pull requests, required CI, conflicting claims, code-owner review, and exact integrated-candidate QA.

Exit condition: satisfy `docs/validation/collaborative-large-scale-test-plan.md`. This phase is not required for the local experiment and cannot be implied by it.

## Planned Work Item matrix

Handles below are planning labels, not actual IDs. Execution creates repository-local durable IDs and a coordinator mapping of `project_id + work_item_id`.

| Handle | Authority | Primary shape | Output | Depends on |
|---|---|---|---|---|
| `COORD-01` | Coordinator | Product specification | Approved protocol, acceptance rubric, budget, and stop rules | Human approval |
| `COORD-02` | Coordinator | Architecture | Domain map, participant registry, contract index, integration ownership | `COORD-01` |
| `CAT-01` | Catalog | Contract design | Availability API v1 specification and compatibility policy | `COORD-01` |
| `ORD-01` | Orders | Contract design | Availability consumer and order-state design | `CAT-01` |
| `NOT-01` | Notifications | Contract design | `OrderPlaced` consumer and delivery design | Orders event contract |
| `CAT-02` | Catalog | Implementation | Availability v1 implementation and tests | `CAT-01` |
| `ORD-02` | Orders | Implementation | Order creation using v1 and event production | `ORD-01`, `CAT-01` |
| `NOT-02` | Notifications | Implementation | Event consumer and deterministic delivery adapter | `NOT-01` |
| `CAT-03` | Catalog | Contract change | Incompatible availability v2 candidate held behind rollout | `CAT-02` |
| `ORD-03` | Orders | Compatibility implementation | Dual-version consumer with rollback path | `CAT-03` |
| `COORD-03` | Coordinator | Integration | Consumer-first rollout join, exact revisions, portfolio refresh | `ORD-03`, `CAT-03`, `NOT-02` |
| `COORD-04` | Coordinator | Failure recovery | Reproduce and recover stale pin, overlap, missing participant, and lost correlation | `COORD-03` |
| `COORD-05` | Coordinator | Cold-task recovery | New task reconstructs scope, state, dependencies, and next action from files | `COORD-04` |
| `COORD-06` | Coordinator | Independent QA | Exact-revision cross-repository acceptance and limitation report | all candidate items |
| `COORD-07` | Coordinator | Evaluation | Descriptive usage-driver and experiment-overhead closeout | `COORD-06` |

Qualification targets at least 10 of the 15 items with exact usage observations across two or more task shapes. All 15 remain part of operational evidence even when their Token fields are unknown.

## Role and task protocol

1. Engineering Manager creates the execution parent and approves decomposition boundaries within the human-approved scope.
2. Product Manager pins the synthetic product acceptance contract.
3. Tech Lead assigns contract ownership, dependencies, affected paths, shared-contract state, integration owner, and waves.
4. Before every separately executed task, run `parallel prepare` for a parallel worker or claim the sequential item.
5. Create a user-owned Codex task only when that execution phase is explicitly approved. Register the stable returned thread ID with the reserved worker or Work Item.
6. Use the suggested title `WI-#### · Position · Agent Name`; the stable thread ID, not the title, is the identifier.
7. Record the task revision and terminal status. A finished chat without registry evidence is not a completed measurement sample.
8. The Integration Owner joins exact candidate revisions and rebuilds the parallel plan after each wave.
9. Quality Evaluator checks acceptance and evidence completeness.
10. A different Agent Identity performs Independent QA against the exact joined revisions.
11. Release Manager records readiness only; no production or public release is part of the experiment.

### Current telemetry limitation

Alpha.27 qualifies one `task_id + task_shape + model` identity per Work Item. Multiple correlated identities exclude that Work Item from the current qualification set rather than cherry-picking one. The experiment must not hide that limitation.

- Operationally, register every real task needed for recovery and audit.
- For Token reporting, state whether the result covers one task, several tasks, or remains unqualified.
- Do not call a single-task observation the total cost of an accepted Work Item.
- If multi-role aggregation is required for the matched evaluation, create a separate authorized implementation Work Item to version that attribution contract before Phase 4.

## Safe execution waves

| Wave | Eligible work | Parallel rule | Join requirement |
|---|---|---|---|
| 0 | `COORD-01`, repository initialization | Sequential | Human budget and path approval |
| 1 | `CAT-01`, Orders event contract, notification design | Parallel only after ownership and exact refs are stable | Tech Lead contract review |
| 2 | `CAT-02`, independent notification fixture work | Parallel where affected repositories and shared resources do not overlap | Catalog v1 candidate pinned |
| 3 | `ORD-02`, `NOT-02` | Parallel across separate repositories | Integration Owner records exact candidates |
| 4 | `CAT-03`, `ORD-03` | Sequential consumer-first compatibility wave | Orders accepts both versions before Catalog switches producer |
| 5 | `COORD-03`, failure injections | Sequential | Joined candidate and rollback refs |
| 6 | Cold recovery, Quality, Independent QA, evaluation | Sequential by lifecycle gate | Exact revision and evidence set |

No work dispatches from a rejected parallel plan. A local mutation lock is not treated as a distributed lock.

## Measurement record

Each observation retains only bounded structured fields.

### Identity and configuration

- experiment and phase ID;
- authoritative `project_id`, Work Item ID, registered Temple task ID, provider thread ID, and attempt chain;
- Position, lifecycle stage at observation, and task shape;
- provider, requested/effective model, model version or alias when available, reasoning effort, service tier, and routing-policy version;
- exact task revision, Context Capsule digest, and capability-set digest.

### Usage

- input, cached-input, output, reasoning-output, and total Tokens;
- provider-reported, versioned local estimate, or `unknown` source;
- quality and missing-dimension list;
- no monetary cost unless a separately approved versioned price source is present.

### Time and coordination

- queued, started, blocked, resumed, candidate-ready, QA-started, and accepted timestamps when observable;
- elapsed, active, blocked, human-wait, and verification time kept separate;
- context-resolution latency, routed file count and bytes, and cold-recovery time;
- handoff clarification count, human intervention count, retries, abandoned attempts, detected overlaps, merge conflicts, and stale-revision rejections.

### Outcome

- accepted, rejected, blocked, abandoned, failed, or unknown;
- first-pass acceptance, defects by severity, rework loops, failed gates, rollback use, and exact-revision QA result;
- repository and contract rollout outcome;
- missing evidence and retained limitations.

### Measurement overhead

Record local parser time, provider-probe latency, output bytes, view size, and disk growth. Reading provider usage metadata adds no model inference Tokens; creating extra prompts, reports, or review tasks does. Those organizational costs remain part of the observed workflow and are not subtracted silently.

## Derived measures

| Measure | Definition | Interpretation boundary |
|---|---|---|
| Tokens per observed task | Provider-reported total delta for one exact qualifying task | Not total Work Item cost when other tasks are unobserved. |
| Tokens per accepted Work Item | Sum only when the versioned aggregation contract proves complete task coverage | Otherwise `unknown`. |
| Cached-input ratio | Cached input / input when both fields are known | High cache use is not automatically high quality. |
| First-pass acceptance | Accepted without a rework transition / completed candidates | Requires an unchanged acceptance rubric. |
| Rework share | Rework attempts / all attempts | Does not distinguish useful iteration without defect classification. |
| Cold recovery time | Start to correct scope/state/next-action checklist | Compare equivalent cold starts, not a warm task. |
| Coordination failure rate | Injected or organic coordination failures correctly detected / applicable cases | A detected injected failure is a framework success and scenario failure. |
| Context efficiency | Routed context bytes and files alongside accepted outcome and Tokens | Smaller context is not better if defects rise. |
| Human intervention | Count and duration of clarification, approval, rescue, and conflict resolution | Human approvals required by policy are not waste. |

## Matched evaluation protocol

Phase 4 is pre-registered after Phase 3, before condition outcomes are inspected.

- Use paired, equivalently scoped synthetic changes drawn from the same task shape and acceptance rubric.
- Hold provider, effective model, reasoning effort, service tier, tool access, repository size, starting revision class, and verification gates constant within each pair.
- Randomize or counterbalance Temple-first versus baseline-first order to reduce learning effects.
- Keep the human approval path and Independent QA requirement identical.
- Estimate variance from Phase 3, choose the minimum meaningful difference, then approve sample size and budget before running pairs.
- Report raw pair outcomes, median and spread, effect size, missingness, failures, and uncertainty. Do not select only successful pairs.
- Separate operational feasibility, descriptive association, and causal interpretation in the final language.

The baseline may use ordinary repository instructions and Codex tasks, but it must not deliberately remove necessary specs, tests, or safety gates merely to make Temple look better.

## Failure injections

| Injection | Expected result |
|---|---|
| Missing participant repository | Portfolio marks participant and dependent result `unknown`; no inferred completion. |
| Dirty canonical participant state | Participant is rejected or marked unknown with reason. |
| Stale or mismatched revision pin | Integration stops until the exact reference is reconciled. |
| Participant project-ID mismatch | Identity failure; no data is merged. |
| Wrong-repository Work Item reference | Composite-reference validation rejects it. |
| Overlapping affected paths | Parallel preparation becomes sequential or requires named resolution. |
| Competing claim | Conflict remains visible; neither claim silently wins. |
| Incompatible contract without rollout | Federation validation rejects the plan. |
| Producer-first breaking change | Acceptance fails and rollback evidence is exercised. |
| Lost Codex task correlation | Usage remains uncorrelated and cannot qualify. |
| Provider usage unavailable | Token fields remain unknown; non-Token evidence continues only if phase rules allow. |
| Model changes inside one qualifying task | Sample is excluded from current Alpha.27 qualification. |
| Same Developer and Independent QA identity | Lifecycle closeout is rejected. |
| Old conversation unavailable | Cold task must recover from repository files or record failure. |

## Budget and privacy controls

- Default execution is local and synthetic.
- Before Phase 1, set explicit ceilings for task count, total observed Tokens when available, wall-clock time, and local disk usage.
- Stop on a ceiling; never purchase capacity, change a plan, or silently fall back to a more expensive model.
- Treat account-wide usage as unallocated and insufficient for project attribution.
- Keep prompts, hidden reasoning, source bodies, tool payloads, credentials, personal data, and provider secrets out of durable experiment records.
- Approve private GitHub, hosted CI, additional humans, additional machines, and company data separately. Public and production actions remain prohibited.

## Plan verification

The planning candidate passes when:

- the ledger review names every nonterminal Work Item and recommends no unauthorized lifecycle mutation;
- the product specification and technical plan cover every `WI-0050` acceptance criterion;
- internal links and repository checks pass;
- Independent QA reviews the exact candidate revision and confirms that no experiment resource or claim was created;
- `WI-0050` stops at `release_gate` with execution still requiring human authorization.

Rollback of the planning artifact is `git revert` of its candidate commit. No experiment state exists to destroy.

