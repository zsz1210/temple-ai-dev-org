# Proportionate small-task delivery and reliable evaluation

Status: design ready for maintainer review; no runtime or policy change is authorized by this file.
Work Item: WI-0225. Evidence baseline: `460514ca6a9671788a38c06a033d23381993b558`.
Audience: the maintainer deciding the next implementation scope.

## Authorized outcome and boundary

The maintainer approved preparing the small-task delivery design and the experiment
reliability repair scope after the broad review. The output is this reviewable
design, including a separate decision about single-Agent completion. Authorization
covers design artifacts and their ordinary Work Item records, not implementation,
model experiments, changed verification rules, default changes, merge or release.

The design must specify eligibility, required context and evidence, escalation,
recovery, bounded implementation ownership, offline acceptance, and the decisions
that later live comparisons can support. Work stops at the completed design.

## Why this work comes before another comparison

The [WI-0210 comparison](../WI-0210/result-report.md) completed two deliveries per
arm. Slim Temple used 2.43% fewer Operational Tokens than prior Temple, but 63.35%
more than ordinary execution, with 33.05% more actor time and equal measured
product acceptance. It reduced entry output by 19.51%, not total work by 19.51%.

[WI-0220](../WI-0220/result-report.md) favored Model representation by 8.48%
Operational Tokens and 4.47% actor time. The only complete pair in
[WI-0224](../WI-0224/result-report.md) reversed direction: +38.85% and +14.64%.
Both formats use Temple. Cache was uncontrolled; these small, different cohorts
cannot establish a general benefit or be pooled into a format preference.

WI-0224 stopped at stage 6/16 on revision syntax, not a failing product test or
resource ceiling. Maintenance never started. Its bounded observations found no
repeated whole-source event and no failed product-test invocation. Do not assume
repeated reads or repair loops explain this result. The discarded operand remains
unknown; the observed Git command completed before actor interruption.

The immediate product question is whether small tasks can retain useful ownership,
acceptance and recovery with materially less obligatory work. The immediate tool
question is whether normal execution and known failures can be qualified offline.
More Full/Model samples are not the next implementation objective.

## 1. Decisions and non-goals

| Decision | State |
| --- | --- |
| Improve existing Lean instead of adding another workflow profile | Accepted direction; implementation pending |
| Select the path by task risk and evidence, not Position title, file count or model | Accepted direction |
| Keep Positions separate from execution sessions and model settings | Existing contract; preserved |
| Keep the current distinct-Identity Verifier in the first implementation | Conservative baseline; no exception activated |
| Allow single-Agent completion for mechanical work | Open policy proposal in section 4 |
| Add a dedicated Maintenance Specialist | Deferred until sustained workload needs a separate assignment |
| Install indexes, Hooks, a daemon, another model router or an experiment platform | Excluded from this work |

Repository permissions, required native instructions, exact managed ownership,
approved scope, candidate-bound evidence and required independence remain. A
Position cannot bypass a gate. Existing Lean eligibility and Standard/High-Assurance
floors remain authoritative until an explicitly reviewed policy change is adopted.

## 2. Eligibility and the ordinary path

Use the existing typed Lean assessment. Scope must be bounded, local, reversible,
low risk and explicit about acceptance. Missing facts are unresolved, not low risk.
Do not add an LLM classification call for every task. The responsible coordinator
records supported facts; deterministic checks enforce the recorded constraints.

| Example | Proposed treatment | Reason |
| --- | --- | --- |
| Correct a typo in non-normative prose at a named location | Lean candidate | Exact change and narrow verification are possible |
| Add a regression case for an already approved behavior | Lean candidate with Verifier | A new assertion still needs semantic review |
| Fix a bounded parser bug with a stable contract and reproducible failure | Lean candidate with Verifier | Small code is not necessarily mechanically verifiable |
| Change a button, layout or interaction | Existing UI route | Current combined Lean entry/finish excludes UI work |
| Change one line in login, authorization or sensitive-data handling | Stronger existing profile | Consequence, not line count, determines risk |
| Change a public API, shared service contract, dependency or migration | Normal risk assessment; no mechanical shortcut | Impact may extend beyond the apparent edit |
| A supposedly small fix needs new requirements or another owner's files | Stop the narrow path and replan | Scope/ownership has changed |

The intended user journey remains request, scoped work, verification and a concise
result. It is not an extra lifecycle. One Work Item and one delivery brief can hold
several named required facts; they do not require several prose documents.

Escalation preserves the candidate, tests, unresolved issue and work already done.
Before Build, use the existing profile assessment. After Build, retain the existing
stop/replan contract; do not silently downgrade, reset state or invent an in-place
profile upgrade. A linked successor may be needed under current rules. Human input
is required for changed business truth, authority or material scope, not routine
steps already inside the approved task.

## 3. First implementation: a smaller obligation, not another display format

The current [Lean entry procedure](../../../.agents/skills/temple-work/references/lean-execution.md)
still requires complete instruction, policy and evidence bodies. The current
[task material implementation](../../../src/context-packet.mjs) already projects
some inventories, and [Model view](../../../src/context-enter.mjs) primarily changes
representation. Do not reimplement those features or call a smaller JSON envelope
the proposed improvement.

Prepare an obligation map before changing instruction sources: each existing
requirement gets its source, triggering operation, actor, replacement location and
an assertion or scenario preserving its meaning. Remove redundant obligations
intentionally; do not silently omit text still required by the active contract.

| Information | Target treatment | Preserved boundary |
| --- | --- | --- |
| Native entrypoint and universal authority/safety rules | Always available through the supported native entrypoint | No claim that a digest proves reading |
| Approved outcome, exclusions, acceptance and relevant product contract | Direct task material | No invented or stale approval |
| Current actor, ownership, exact candidate, unresolved facts and next operation | Complete relevant records | Position, Identity and authority remain separate |
| Procedures for the current operation | Complete operation-specific instruction module | Load required modules before acting; do not truncate prose by length |
| Unrelated UI, tracker, release, high-assurance or parallel procedures | Routed when their trigger applies | A newly relevant condition escalates rather than hiding its rules |
| Full inventories, hashes and schema-validation detail | Full deterministic validation; compact relevant results to the actor | Missing/unknown structure cannot silently pass |
| Historical evidence unrelated to current acceptance | Reference with provenance, fetched when relevant | Required current evidence remains available and version-bound |

The largest proposed change is operation-scoped instruction authoring/routing, not
an LLM summary of existing rules. Start with eligible Lean Build/Test. Required
native instructions and any explicitly required whole-source read still apply.
If the existing contract cannot support an omission, revise that contract and its
managed templates together before enabling it; an opt-in prompt is not permission.
Cold sessions read the material they need. Same-session reuse is valid only for
actually read, available, unchanged bodies. No inferred session memory is added.

Use existing claim, handoff and finish operations. Keep one substantive evidence
record per result and reference it from the Work Item/receipt instead of asking
the Agent to narrate it again. Tool-produced command exit, revision and diagnostic
facts can populate records; they cannot supply semantic acceptance judgment.
Current full Status/Doctor results from finish need not be rerun solely to restate
them. Changed candidate or authority invalidates the corresponding evidence.

First-release fallback: retain the previous entry/material path. Unknown source
shapes or unsupported operations take the explicit existing route. No new default,
cached approval, cached passing test or automatic role change is introduced.

## 4. Separate policy decision: mechanical single-Agent completion

This is not implemented or adopted. Existing Lean still uses a distinct Verifier
Identity; formal Independent QA must never be the Developer's own certification.

| Option | Benefit | Cost or risk |
| --- | --- | --- |
| A. Keep a distinct Verifier for all current Lean work | Isolates the first context/procedure intervention | Retains a fresh actor's fixed cost |
| B. Later permit a tightly allowlisted mechanical exception | Can remove an otherwise unnecessary full actor handoff | Misclassification or incomplete checks could miss a semantic change |

Recommendation: implement A first; keep B available for a separate maintainer
decision and separate evaluation. Do not combine context reduction and removal of
the Verifier in one candidate, because their effects would be indistinguishable.

If B is approved for design, start with an exact replacement in non-normative
prose, where the human-approved before/after text, exact target and allowed diff
are known before execution. Require an independently specified deterministic check
of the permitted diff and existing relevant checks. Self-written tests alone do not
establish that the change is mechanical. Even a prose typo may affect a specification.

Exclude instructions, Skills, executable examples, specifications, legal/security
text, UI, code behavior, test assertions, dependencies, release material and unknown
files from that initial exception. Any mismatch returns to ordinary verification.
Retain the Work Item, accountable actor, actual diff, tested revision, command
results, reversibility and explicit completion classification. Never label such
completion Independent QA or quietly change the existing Quality Evaluator's owner.
Changing the route requires an ADR, contract/schema design and migration review;
this document invents no executable command or new fourth workflow profile.

## 5. Experiment reliability repair

The [current preflight](../../../scripts/diagnostic-format-comparison.mjs) uses fixed
command/exec probes. The [live observer](../../../scripts/delivery-control-pair.mjs)
classifies provider command strings. Qualify both through the same parsing and
event-handling path before another live protocol is approved.

| Repair | Offline acceptance |
| --- | --- |
| Shared command contract for actor guide, preflight and live observer | Complete synthetic Build/Verify sequences, real installed CLI forms and retained event envelopes are accepted or rejected identically |
| Safe failure detail | Record phase, failing argument index, revision category, exit/recognition status and first-stop ID; raw commands, paths and private outputs remain excluded |
| Event replay | Duplicate, delayed, malformed, started/completed and missing-usage events produce deterministic classifications and never double-count usage |
| Negative controls | Deliberately wrong candidate binding, missing usage, bad oracle result and unsafe boundary attempts fail the intended assertion |
| Shared future runner core | Schedule/fixture data vary without copied prepare/execute/seal loops; frozen historical runs and source identities remain unchanged |

Do not build a general shell interpreter. Document the bounded supported forms and
use safe normalization only where its semantics can be proven. Observed command
rejection is not OS-level prevention; sandbox and tool authorization are separate.
For old failures with discarded values, synthetic cases prove their own behavior,
not a reconstructed historical cause. Newly captured structural detail should make
future failures reproducible without retaining sensitive operands.

Define stop classes in the next protocol, before collecting outcomes:

- Global stop: authority/isolation/privacy breach, uncontained process, changed
  frozen source, unreliable shared accounting or aggregate resource exhaustion.
- Local failure: product acceptance fails in an otherwise valid isolated case.
  Preserve the failed sample; skip dependent stages without presenting them as
  passed. Other independent cases may continue only if preauthorized and isolated.
- Local invalid observation: a safely classified instrumentation problem affects
  one case. Mark it invalid, retain its cost, and continue only after confirming
  no shared validity or cleanup problem. Unclassified impact remains a global stop.

No automatic retry or replacement of a failed sample. Reuse a completed stage only
under a predeclared checkpoint contract binding source, input, protocol and side
effects; otherwise use a separately identified cohort. Never resume WI-0224's
consumed approval or retrofit the old sealed result.

## 6. Implementation order and ownership

After design approval, two bounded streams can proceed without shared edits:

| Slice | Proposed ownership | Completion evidence |
| --- | --- | --- |
| A: Lean obligations and material | Relevant instruction modules, managed templates, context entry/packet source and their tests | Requirement map, measured emitted material, fallback and authority regression cases |
| B: Instrument reliability | Delivery command policy/observer, one shared runner path and focused harness tests | Same-path replay corpus, negative controls, typed stops and cleanup/accounting checks |
| Integration | One named integration owner after both slices | Combined exact candidate, full local verification, required separate review |

Actual write paths and any shared tests are resolved before dispatch; this table is
not a parallel preparation or worker reservation. Do not give two actors ownership
of the same entry file. Model selection stays under current project policy and is
not changed by this design.

Focused tests support editing. Run complete verification once on the final behavior
candidate; substantive later changes require appropriate revalidation. Pure design
prose uses fast verification, and canonical records require Doctor. No paid model
call is needed to prove deterministic parser, state or accounting behavior.

## 7. Later live evaluation must answer a decision

Do not repeat the old format matrix. First qualify the instrument offline, freeze
the implemented candidate and decide whether live evidence is needed for the
remaining question. A generation-free replay is instrument evidence, not an extra
sample of model effectiveness.

Two questions are retained, measured separately:

1. Small-task burden: does the new Lean material/procedure reduce total delivery
   work relative to current Lean while preserving its acceptance and ownership?
   Include a competent ordinary workflow to expose remaining framework overhead.
2. Continuity: when a fresh Agent takes over unfinished work, does Temple reduce
   rediscovery, wrong-state continuation, duplicated changes or missed acceptance?
   Give the ordinary workflow reasonable tests, repository documentation and a
   concise handoff too; do not withhold useful tools or manufacture a weak baseline.

Freeze the task, product oracle, model/effort, tools, permissions and candidate.
Change one delivery intervention; the single-Agent proposal and model selection
remain separate. Counterbalance order within each task family and report cold
entry separately from later reuse. A fixed early family must not consume all the
opportunity to test the unanswered question; scheduling and continuation rules
are decided before execution, never adjusted to obtain a favorable result.

Report all attempted work and cost, completed matched pairs, acceptance, human
interventions, rework and recovery errors separately. Operational Tokens are input
minus cached input plus output, not price. Show the raw components and cache
conditions. Count setup/indexing, coordination and review costs when observable;
otherwise label them excluded or unknown. Tool notification gaps are not reliable
subprocess timings and cannot be subtracted to invent model thinking time.

Decision rules for the eventual protocol:

- Authority or acceptance regression prevents recommending adoption.
- Smaller emitted bytes alone do not qualify the candidate.
- A decision-relevant improvement in complete-delivery resource/time or continuity
  with preserved quality can support limited opt-in adoption for the tested shape.
- Mixed directions, missing pairs or substantial unmeasured overhead retain an
  inconclusive/optional outcome; do not automatically add samples to chase savings.
- No meaningful benefit means stop this optimization or remove its added complexity.

Before a live launch, the maintainer must select the practical tradeoff that would
change adoption, informed by baseline distributions and the value of the task.
Specify the minimum useful effect, quality margin, sample rationale, finite maximum
and no-extension decision rule then. No arbitrary percentage, new sample count or
resource authorization is invented here. This design is not launch-ready.

## 8. External ideas retained as references, not dependencies

- [Graft](https://github.com/trailhq/Graft#swe-bench-verified): distinguish all-attempt
  cost from successful-pair comparisons, and count construction/reuse costs.
- [ECC audit](https://github.com/affaan-m/ECC/blob/e04ea0b9cc8248686edf5ac751cadff550e162b8/scripts/harness-audit.js): deterministic readiness is useful; file/Hook presence scores are not measured delivery benefit.
- [ToolRush negative controls](https://github.com/lunkerchen/toolrush/blob/20a7a7dcab7a9a240c70f195f3a2e6e5565f9116/v2/README.md#verification): prove that removing the intended mechanism makes the corresponding test fail; do not transplant its Hermes executor.
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/): use bounded event relationships and timing concepts, without making a daemon or telemetry platform mandatory.

These sources informed the preceding review. No upstream performance percentage is
adopted as Temple evidence and no integration, dependency or Skill is installed.

## Design completion checklist

- Eligibility and non-eligibility include concrete cases, not a line-count rule.
- Required obligations and fallback are preserved; proposed removals are explicit.
- The single-Agent exception is separated from the first implementation and not approved.
- Offline repairs target the live failure path, with negative controls and privacy limits.
- Later comparisons have named product decisions, honest denominators and a finite stop boundary.
- Implementation, live execution, approval thresholds and publication remain unperformed.

## Verification of this design slice

Author review checked the proposed omissions against current required-read and
verification boundaries, separated policy adoption from implementation, and kept
historical experiments immutable. `npm run verify:fast` passed repository,
documentation-link and package checks plus 54/54 fast tests. These are design
consistency checks, not Independent QA or measured evidence that the proposal
improves delivery. Behavioral verification belongs to the later implementation.
