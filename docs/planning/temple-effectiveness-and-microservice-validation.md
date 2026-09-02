# Temple effectiveness and multi-repository validation plan

- Status: Waves 1–3 passed with retained limits; Wave 3 is independently verified for one deterministic local four-repository rehearsal
- Scope: local-first synthetic validation
- Public, production, GitHub, hosted CI, and paid actions: not authorized

## What this stage is for

Temple already has working local foundations for roles, Work Items, handoffs, retrieval, federation, telemetry, and a human-facing Workspace. The next useful step is not another feature or a release. It is a controlled rehearsal that can tell us what works, what fails, and what we can actually measure.

The experiment uses a small fictional commerce system so it can exercise realistic service boundaries without using company or production data.

```mermaid
flowchart LR
    H[Human owner<br/>scope, budget, approvals]
    C[Coordinator<br/>initiative, contracts index,<br/>read-only portfolio]
    A[Catalog<br/>availability authority]
    O[Orders<br/>order authority]
    N[Notifications<br/>delivery authority]
    M[Measurement<br/>usage, time, rework,<br/>recovery, QA]

    H --> C
    C -. exact refs .-> A
    C -. exact refs .-> O
    C -. exact refs .-> N
    A -->|Availability API| O
    O -->|OrderPlaced event| N
    A --> M
    O --> M
    N --> M
    C --> M
```

Each service remains the only authority for its own lifecycle. The coordinator can show cross-service status and rollout order, but it cannot approve, close, or release a service Work Item.

## The five evidence levels

| Level | What we do | What we may conclude |
|---|---|---|
| 1. Instrumentation | Run one approved synthetic task through registration and usage observation. | Whether measurement is available, partial, or unavailable. |
| 2. Local rehearsal | Run four sibling repositories, exact contracts, failures, recovery, and QA. | Whether this bounded local scenario works. |
| 3. Longitudinal observation | Complete at least ten correctly correlated varied Work Items. | Which usage and coordination drivers appeared in this sample. |
| 4. Matched evaluation | Run predeclared equivalent task pairs with controlled model settings. | A bounded difference for the tested scenarios, with uncertainty. |
| 5. Collaborative qualification | Add several humans, machines, protected Git hosting, PRs, CI, and conflicts. | Whether that named enterprise-like scenario passes. |

Level 1 does not prove savings. Level 3 can identify patterns but not causality. Level 5 requires new permissions and is deliberately retained for later.

## Repositories and responsibilities

| Repository | Owns | Does not own |
|---|---|---|
| Coordinator | Experiment protocol, cross-service Initiative, domain map, contract index, rollout plan, read-only portfolio | Service lifecycle, credentials, local approvals, service releases |
| Catalog | Product availability API and implementation | Orders behavior or notification delivery |
| Orders | Order creation, state, and `OrderPlaced` event | Catalog availability authority or notification delivery |
| Notifications | Event consumption and delivery behavior | Order state or producer contracts |

The planned contract change intentionally requires a consumer-first rollout: Orders must accept both availability versions before Catalog switches its producer behavior. This tests whether Temple makes the dependency and rollback visible instead of relying on chat memory.

## Planned work

The execution plan contains 15 role-shaped Work Items across product specification, architecture, contract design, implementation, compatibility, integration, failure recovery, cold-task recovery, Independent QA, and evaluation. At least ten must complete with exact Work Item, task, revision, Position, model, and outcome correlation before the usage baseline becomes longitudinally qualified.

The work runs in waves:

1. Approve protocol, local paths, and budget.
2. Initialize four independent repositories and pin authority.
3. Design stable API and event contracts.
4. Implement disjoint service slices in safe parallel waves.
5. Run the consumer-first incompatible-contract rollout.
6. Inject stale, missing, overlapping, conflicting, and uncorrelated states.
7. Recover the project in a fresh task using repository evidence only.
8. Run exact-revision Independent QA and produce a limitation-aware report.

Parallel work starts only after claims, affected paths, shared contracts, resources, and integration ownership are recorded. A generated plan alone never creates or authorizes a Codex task.

## What will be measured

### Model usage

- input, cached-input, output, reasoning-output, and total Tokens when the provider reports them;
- requested and effective model, version or alias, reasoning effort, and service tier;
- exact Work Item, task, attempt, Position, lifecycle stage, revision, and outcome;
- missing fields and observation quality.

Reading provider usage metadata does not itself create model inference Tokens. Extra prompts, reports, and review tasks do consume Tokens and stay part of the observed workflow.

### Delivery and coordination

- elapsed, active, blocked, human-wait, and verification time;
- first-pass acceptance, defects, rework loops, retries, and abandoned attempts;
- context-resolution size and latency;
- cold-task recovery time and correctness;
- handoff clarification and human intervention;
- overlap detection, merge conflict, stale revision, contract drift, rollback, and QA outcome.

Token counts are a diagnostic signal, not a verdict. A design or Independent QA task may use more Tokens and still reduce total rework or risk.

## How we avoid proving our own marketing

- We predeclare acceptance, metrics, allocation, budget, and stop rules.
- Missing values remain unknown rather than becoming zero.
- The first rehearsal reports descriptive results only.
- A later comparison uses equivalent task pairs and holds model, reasoning, tools, repository conditions, and QA rules constant.
- We report failed tasks, exclusions, overhead, uncertainty, and limitations alongside successful results.
- The baseline keeps necessary specifications, tests, and safety gates; it is not intentionally weakened.
- No automatic model routing is enabled from these observations.

## Known measurement limitations

The current Alpha.27 usage qualification accepts one task/model/shape identity per Work Item. A Work Item with several correlated task identities is excluded rather than cherry-picked. The cross-repository report now composes those already-qualified local samples with `project-id:WI-####` identities, so the ten-item observational threshold can span several repositories without weakening local qualification.

That aggregation does not establish monetary cost or complete workflow cost. Unknown Token fields remain unknown; task duration is not inferred from chat timestamps; and a Work Item excluded locally stays excluded globally. A controlled matched baseline is still required before any savings claim.

## Failure is useful evidence

The rehearsal deliberately tests:

- missing, dirty, stale, invalid, and identity-mismatched repositories;
- wrong composite references and incompatible contracts without rollout;
- overlapping write scopes and competing claims;
- producer-first breaking changes and rollback;
- missing task correlation or provider usage;
- model changes that invalidate a sample;
- the same identity attempting Developer and Independent QA;
- recovery without access to prior conversations.

Temple should reject, block, or label these conditions unknown. Silently repairing the fixture would fail the experiment.

## Approval and resource boundary

This plan creates nothing outside the current repository. A later execution requires explicit approval for:

- the experiment design and local repository locations;
- its Token, wall-clock, compute, and disk stop limits;
- every real Codex task wave;
- private GitHub repositories, hosted CI, or additional machines;
- sensitive or company data;
- any public, production, deployment, or release action.

The experiment stops when a ceiling is reached, correlation is lost, authority would be crossed, QA independence fails, or the owner withholds the next gate. Stopping with an honest limitation is a valid outcome.

## Cross-scenario adoption baseline

The later [Wave 1 adoption evidence](../validation/wave-1-adoption-evidence.md) normalizes the retained FlowDeck, IdeaDock, AiPet, and self-host results and adds a no-generation brownfield rehearsal. That local baseline passed with limits: project-native documents and history were preserved, one exact-candidate lifecycle closed, and the optional Observer, Usage Collector, and Management Console were not required.

This is complementary evidence, not a replacement for the stopped four-repository model experiment. Independent-human adoption, multi-machine collaboration, multi-repository delivery, and matched Temple-versus-baseline measurements remain separate later waves.

## Cross-scenario coordination baseline

The [Wave 2 coordination evidence](../validation/wave-2-coordination-evidence.md) reconciles the live IdeaDock parallel run with Alpha.16 planning tests, Alpha.17 recovery tests, Alpha.28's disposable two-clone simulation, and Temple's own repository-backed handoffs. It supports bounded single-human, single-machine coordination: isolated live workers, exact candidate joins, stale-plan handling, resource-aware serialization, and recoverable local preparation.

No extra local fixture was added because it would repeat an existing evidence class. Real protected-PR collaboration remains `not_run` until different people use independently administered environments. Wave 3 may proceed to a bounded local multi-repository rehearsal, but this result does not resume `WI-0067`, increase a Token ceiling, install Docker, or authorize another model-backed task wave.

## Local multi-repository service baseline

The later [Wave 3 local multi-repository evidence](../validation/wave-3-local-microservice-evidence.md) uses a separate no-generation Work Item rather than resuming `WI-0067`. Four disposable Git repositories exercised Catalog v1/v2, Orders v1-only/compatible, an idempotent `OrderPlaced` consumer, exact federation references, a producer-first failure, rollback, consumer-first recovery, malformed-event recovery, and cold aggregate reconstruction.

The Developer run passed its six scenarios in 95.005 seconds. Peak measured host growth during the run was 304,959,488 bytes. The dedicated container profile and its one downloaded VM-image cache were removed afterward, reclaiming 1,812,885,504 host bytes; no broad prune ran. Independent QA then passed the exact candidate with 280 repository tests and 59 separate evidence assertions. This remains a single-human, single-machine local result; it does not qualify the collaborative, production, savings, or Token claims reserved for later waves.

## Decision after this plan

The planning review records that decision as `WI-0061`. The repository owner approved the exact local path, GPT-5.6 profile, Token, time, disk, retry, correlation, and stop boundaries in [the bounded instrumentation pilot proposal](../../.ai-org/artifacts/WI-0061/pilot-proposal.md) on 2026-08-31. Approval does not itself mean that the pilot has run; execution remains a separate, bounded Work Item.

WI-0062 subsequently ran that one-turn instrumentation pilot. It produced task-correlated detailed Token usage but remained `partial`: Temple had preserved the requested model while failing to read the Provider-acknowledged model from the documented top-level `thread/start` response. The four-repository experiment therefore remains blocked by the minimum model-correlation gate.

WI-0063 corrected Provider model acknowledgement. WI-0064 then performed the separately governed revalidation and stopped no-go because the installed protocol did not expose a direct effective-turn reasoning-effort acknowledgement. WI-0065 corrected the data model instead of guessing: Temple now records requested turn effort, thread-reported effort, and effective-turn effort separately, leaving the last value unavailable when the Provider does not report it.

WI-0066 adds the reusable control boundary needed before the larger rehearsal: a versioned manifest, semantic safety checks, durable wave and attempt checkpoints, cumulative Token interruption, wall-clock and disk ceilings, path allowlists, zero retry, and a cross-repository report that cannot grant lifecycle or marketing authority. Its framework verification does not itself start a model turn.

WI-0067 executed the retained model-backed four-repository commerce rehearsal under that envelope. The no-generation protocol and Luna Max preflight passed, then both Wave 1 turns reached the 60,000-Token per-turn ceiling. The first actionable Provider events reported 74,266 and 74,382 Tokens, Temple interrupted both turns, the program stopped after two launch attempts, zero retries occurred, and the remaining eight turns were not launched. No product file changed.

The run is therefore a useful stopped-boundary observation, not a successful model-backed or longitudinal baseline. It also exposed a pre-run validation gap: the live adapter's worktree-local telemetry path was readable by the runner but rejected by the formal report builder, which requires the Git common directory. Raw telemetry was preserved and local usage projections were rebuilt, but the stopped manifest was not resumed or rewritten.

WI-0104 later supplied an explicitly approved deterministic local replacement for the service and federation questions only. It did not resume the stopped manifest, launch a model turn, increase a Token ceiling, or satisfy the longitudinal usage question. Any future model-backed replacement still needs its own corrected configuration and resource approval.
