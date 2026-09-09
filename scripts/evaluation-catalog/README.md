# Reusable evaluation preparation

This is a repository-only **offline planning layer**, not a model execution engine
or installed Temple feature. It reuses the existing [evaluation method](../../docs/operations/model-and-process-evaluation.md)
and [protocol template](../../.ai-org/templates/model-process-evaluation-protocol.json).
Keep [execution safety](../../docs/operations/validation-programs.md) in the existing
qualified adapters. The older validation-program contract does not accept every
model listed here; selecting GPT-6 does not change that contract.

The reader is a maintainer preparing a comparison. Change JSON selection data for
ordinary model/mode/scenario changes. Change and requalify an adapter only when the
experiment needs a new executable capability, interruption mechanism or oracle.
The [participant prompt layers](prompt-layers.md) provide common, ordinary and
Temple scaffolds. A separate repository-only candidate compiler can assemble a
contract from trusted inputs; this planner never renders or sends participant prompts.

## Preview a selection

From this repository, with its documented Node.js runtime:

```bash
node scripts/evaluation-plan.mjs --catalog scripts/evaluation-catalog/catalog.json --plan scripts/evaluation-catalog/selection.template.json
```

The demonstration prints eight unrun cells: two small scenarios × two models ×
ordinary/Lean × one repetition. **It is not the next approved experiment.** It
contains no fabricated live budget or source qualification. Unknown totals are
null; `launch_ready` and `model_generation_authorized` are always false.

To preview a smaller selection, filter catalog IDs:

```bash
node scripts/evaluation-plan.mjs --catalog scripts/evaluation-catalog/catalog.json --plan scripts/evaluation-catalog/selection.template.json --scenarios small-bug --models terra-medium,gpt6-medium --variants general,lean-current
```

Both commands read JSON and print JSON. They do not write files, run tests, contact
a provider, resolve Git refs, check out code, or launch a fixture. The caller may
save stdout as an explicitly named draft. Invalid configuration exits 2; a valid
draft with qualification gaps exits 0 and lists them. Automation must inspect the
JSON, not treat exit 0 as launch readiness.

## Separate the factors

| Selection factor | What changes | What stays fixed |
| --- | --- | --- |
| `process` | Ordinary Codex / Temple mode | One model/effort and one Temple revision |
| `model` | Multiple model/effort entries | One explicit mode/version variant |
| `framework-version` | Before/after exact Temple revisions | One model and one Temple mode |
| `factorial` | Models crossed with explicit process/version variants | Same scenario seeds, acceptance, tools and measurement contract |
| `descriptive` | Exploratory collection | No isolated causal interpretation |

For before/after, select `lean-before,lean-after`, one model, and
`decision.factor = "framework-version"`. Set the two `framework_revision` values
to actual full Git SHAs. The product seed and acceptance pins belong to the
scenario, so they stay the same across both variants. Never substitute the completed
solution from a previous run for its initial seed. Duplicate known mode/version
pairs and incomplete multi-mode/multi-version factorials are rejected.

For a two-model before/after comparison, use `factorial` with the same two variants.
For multiple Temple modes at multiple revisions, provide every intended mode ×
revision pair. Ordinary Codex has no Temple revision and is not duplicated per
Temple version. Do not call the combined change a single-factor improvement.

The JSON selection identifies the implementation model and effort. The common
Verifier is separately fixed in `controls.verifier`; compare its cost too. A mode
can choose intermediate planning or multiple agents only within the frozen model,
tool, resource and budget contract. Record effective, not merely requested, models
when executing. Model IDs in the catalog are requests, not availability checks.

## Scenarios and modes

| Scenario | Complexity | Risk | Existing material | Remaining qualification |
| --- | --- | --- | --- | --- |
| `small-bug` | Simple | Low | Atomic batch fixture | Exact seed/oracle/adapter rehearsal |
| `async-feature` | Simple | Low | Async retry fixture | Exact seed/oracle/adapter rehearsal |
| `cross-module-learning` | Complex | Standard | Corrected twenty-case oracle | Fresh installed positive control and dependency fingerprint |
| `interruption-recovery` | Complex | Low | Real documentation checker and continuity runner | Equal semantic interruption trigger and recovery qualification |
| `authority-boundary` | Simple | High | Adversarial policy scoring | New synthetic delivery adapter and controls |
| `migration-rollback` | Complex | High | High-Assurance contract | New synthetic migration/rollback fixture |

Risk and complexity are independent. Scenario eligibility is an explicit
experiment design proposal, not a new assessment of old Work Items. A high-risk
Temple cell cannot become Lean by editing its allowed-modes list. Ineligible
combinations remain in the preview; they are never silently skipped or relabeled.

`general` means a participant with **no installed Temple instructions or lifecycle**.
The experiment still supplies common requirements, a sandbox and external grading.
Report this accurately as ordinary Codex plus the same external evaluation. Shared
grading or coordinator protection is not evidence of Temple-specific benefit.

`temple-lean`, `temple-standard` and `temple-high-assurance` refer to current
framework requirements at the selected revision. The declared mode must actually
be installed and exercised by its eventual adapter. Do not reuse a specialized
Lean harness and label it Standard. `temple-core-candidate` now has a repository-only
[contract/recovery/completion prototype](../core-autonomy-candidate.mjs), described
in [ADR-0063](../../docs/adr/0063-core-autonomy-research-candidate.md), plus a separate
[stage adapter](core-runtime.md) for the selected four-cell screen. Model-driven
tool qualification and exact launch approval remain pending. The planner has no
bridge to that adapter: its legacy `unimplemented:candidate-mode` block stays in
place even if a revision is supplied. Compilation does not launch
a worker, validate snapshot provenance, enforce a runtime budget or grant authority.

Use the same external-action prohibition and outcome safety invariants in every
high-risk arm, including ordinary Codex. All such fixtures are local simulations;
no real sensitive data, production deployment or external write is implied.

## Budget the complete delivery

`budget.per_scenario[scenarioId]` has a textual `basis` and eight reservation objects:
`setup`, `build`, `verify`, `repair`, `reverify`, `variability`, `usage_lag`, `cleanup`.
Each object contains nonnegative integer `tokens`, `time_ms`, and `calls`. Tokens
are operational tokens: gross input minus cached input plus output. This is not a
monetary or hard provider billing limit.

- Build and Verify reserve positive tokens/time and at least one call each.
- A repair allowance requires matching or greater reverification call capacity.
  With no repairs, both repair and reverification calls are zero. These are capacity
  categories, not a prescribed internal sequence or permission to retry.
- Variability, usage-notification lag and cleanup each need positive token/time
  reserves and zero generation calls. Do not hide them inside the Build estimate.
- `batch_overhead` reserves outer coordination/qualification capacity separately;
  supply explicit zero only when justified. `ceilings` supplies the aggregate
  token/time/call envelope.

The preview sums every selected cell, including ineligible cells, plus batch
overhead. It never silently removes reservations. If any cell or overhead is
unknown, the total stays null and `known_subtotal` is only the known portion.
Identical per-scenario ceilings are applied across selected models/modes in v1;
derive them from the largest justified full-delivery requirement. Different budget
treatments require a separately declared design, not silent favoritism.

Time is the sum of sequential reservations, not a wall-clock prediction. Do not
infer a universal buffer percentage from the example tests. Before launch, use
relevant observations to set an expected amount, variance allowance, notification
lag reserve and cleanup reserve; reserve downstream verification and allowed repair
before starting a new actor. The execution adapter, not this preview, must enforce
the stop/abort/cleanup contract and the actual remaining budget.

## Freeze, execute and compare

1. Name the decision and inspect retained compatible evidence. Do not rerun every
   historical control merely to fill a rectangle. Select only decision-changing
   cells; one repetition is a diagnostic screen, not statistical qualification.
2. Pin scenario product revision, fixture and acceptance SHA-256; runtime, tools,
   measurement and common-prompt digests; and every assembled mode prompt via
   `variants[].mode_prompt_digest`. Pin the complete transitive execution/installer
   dependency set in the frozen execution protocol. Planner hashes identify JSON
   content; they do not prove that referenced code exists or was read.
3. Rehearse an independently correct product, a known wrong product, installation
   failure, interrupted accounting, cleanup acknowledgement, repeat invocation and
   no-double-dispatch behavior. Qualify the selected adapter/model/effort/usage
   contract. An instrument fault cannot be scored as poor model quality.
4. Freeze the existing evaluation protocol with a predeclared order/cache method,
   acceptance, decision rule, repetitions, full budgets and exact launch authority.
   Seeded preview ordering is reproducible, not itself a verified cache control.
   Do not change the executor midway and keep calling it the same experiment.
5. Execute only through a separately qualified adapter. Preserve original sealed
   observations; add stopped and unrun cells. Retry/fallback/reroute/reset are never
   implied. A new oracle regrade becomes a separate linked observation.
6. Use [the observation-index template](observations.template.json). It is a data
   contract draft, not an importer or automated analysis engine. Compare first-pass
   quality and final delivery separately, then tokens/cache, time, repairs, human
   intervention and administration. Preserve partial lower bounds and missing data.

Do not rank a failed or censored delivery as a cheap success. Do not add reasoning
tokens twice, add overlapping actor/tool clocks into wall time, pool incompatible
historical cohorts, or credit shared experimental QA exclusively to Temple.
Quality, efficiency and risk protection need separate conclusions. No single
winner score, automatic routing change or monetary claim is produced here.

The core candidate and limits of the available observations are described in the
[checkpoint summary](../../docs/validation/autonomous-main-checkpoint.md). This preparation
does not resolve the historical stopped WI-0263 comparison or its original journals.

The selected next diagnostic screen has its own
[four-cell selection](core-comparison.template.json) and
[qualification contract](core-comparison.md): complex low-risk interruption recovery,
current Temple Lean versus the Temple core candidate, crossed with Terra Medium
and GPT-6 Medium. Preview it with the same command and that selection path. It is
not ordinary Codex versus Temple, and is not ready to launch. Later ordinary/Temple
and before/after comparisons reuse the same planner with different selection data.

The [core runtime preparation guide](core-runtime.md) describes the repository-only
stage adapter, actual installed-provider qualification, fresh-process rehearsal and
concrete buffered proposal. It retains an exact approval requirement and first-subject
canary; the catalog planner alone still cannot authorize or execute a live cell.
