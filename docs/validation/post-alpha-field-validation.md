# Post-Alpha field validation

Status: plan prepared under WI-0169. No new field observation or model experiment has run under this plan.

Temple's next validation should measure the work its organization is meant to improve: recovering after a task change, coordinating ownership, and retaining useful review evidence. The outcome should tell maintainers which mechanisms to keep, simplify, or change.

## Evidence already available

- [WI-0135](lean-routing-effectiveness-result.md) found equal correctness and blind quality in two small coding cases. Temple's candidate time was 19.77% lower, but Operational Tokens were 1.76% higher. The registered result was neutral.
- [WI-0136 v16](../../.ai-org/artifacts/WI-0136/representative-main-v16-report.md) found equal quality in one multi-repository pair. Temple used 3.51% fewer Operational Tokens and 2.72% less measured model latency, while integration was 18.70% slower and its artifact footprint was 1062.65% larger.
- [WI-0143 findings](context-capsule-successor-evaluations.md) showed eight correct candidates and complete acquisition classification. Cache balance failed, and resource changes differed by repository shape. Its proposed successor programs remain unexecuted.
- [WI-0158](final-pre-alpha-clean-room.md) demonstrated bounded fresh-session delivery and cold recovery without Human intervention. Token totals were unavailable. It is pre-freeze evidence, not a measurement of the published Alpha.30 package.

These observations justify investigating continuity and coordination while measuring their overhead. They do not establish general savings or automatic model-routing eligibility.

## First three scenarios

The scenarios are ordered by preparation cost and the decision they can inform. Each needs a concrete task before execution; the table does not authorize changes in an existing project.

| Order | Scenario | Question | Observable completion |
| --- | --- | --- | --- |
| 1 | A bounded single-repository change, followed by a fresh task recovering work paused before QA | Can the new task recover current scope, revision, owner, remaining work, and the safe next action without a maintainer briefing? | A frozen recovery answer and executable acceptance result, with interventions and recovery time recorded |
| 2 | A change to a disposable copy of an existing project with established documents and tests | Can Temple preserve the existing documents and project-owned files while making a useful bounded change? | Accepted change, preserved-file digest comparison, and recorded onboarding and workflow friction |
| 3 | A contract change spanning a coordinator and participant repositories | Does ownership and handoff structure reduce duplicate work or stale-contract integration? | Matching contract revisions, integration checks, independently checked findings, and a complete coordination-cost record |

Start with scenario 1. The existing QueueKeep fixture may be reused as a frozen disposable base, subject to inspection. Stop after the selected change and recovery measurement; the sample does not become a continuing product project. FlowDeck remains stopped. AiPet or another real repository requires an explicitly selected task and isolated copy before scenario 2.

Scenario 3 should reuse the previously qualified local service fixture where possible. First identify one concrete coordination failure mode the earlier happy-path comparison did not resolve. Repeating an unchanged successful run would not answer that question.

## Field use and controlled comparisons

During an approved real project task, collect a small completion record from repository evidence and available Provider usage. Such an observation can reveal friction and useful recovery behavior. It cannot estimate the difference from a workflow that was never observed.

For scenario 1's controlled pilot, give a competent conventional workflow and Temple the same product task, starting application revision, acceptance tests, tools, and requested model settings. The conventional workflow may use ordinary project instructions, tests, and a useful handoff note. Do not weaken its instructions to manufacture a Temple advantage.

Apply the same interruption point to both arms, such as implementation submitted and QA not yet complete. Each arm's fresh recovery session receives its own repository and the same recovery question, with no previous conversation. Freeze expected facts before scoring and use the same objective rubric. A wrong answer remains a failure even if it uses fewer Tokens.

Use independent copies and alternate or randomize arm order. Report preparation, delivery, handoff, recovery, and verification costs separately as well as end to end. A single matched pair is a feasibility pilot; the eventual confirmation sample size needs a declared useful effect and adequate dispersion estimates. This plan sets neither a statistical sample count nor an arbitrary resource ceiling.

## Measurements

| Measure | Collection and interpretation |
| --- | --- |
| Correctness | Application acceptance checks and exact recovery facts; retain both failed and passed attempts |
| Human intervention | Every unplanned clarification, correction, or unblock, with reason and available elapsed time; routine release approval is classified separately |
| Rework | An attempted change later corrected because of an acceptance, review, or coordination defect; label the cause and avoid counting the same fix twice |
| Coordination | Conflicting claims, duplicate attempts, stale-contract use, and time spent resolving each; record detected events rather than hypothetical work avoided |
| Time | End-to-end elapsed time plus phase durations; with parallel work, distinguish wall-clock time from summed Agent time |
| Tokens | Input, cached input, output, non-cached input plus output, and observation coverage; missing values stay unknown |
| Execution configuration | Requested and acknowledged model and effort; report unavailable effective effort explicitly |
| Operating overhead | Setup, framework commands, context reads, generated file count and bytes, and measurement work itself |

The Console and continuous Observer are optional. Prefer existing per-task usage or bounded on-demand collection when available. Verify the actual Provider interface before implementing collection. If telemetry is unavailable, functional observations remain useful, but the report cannot claim Token savings.

Keep cache share visible in controlled results. A comparison intended to attribute Token differences to context routing must resolve the measurement issues retained in WI-0144 first. A failed cache control remains a limit on causal efficiency claims.

## Before the first executable pilot

1. Select the bounded task and frozen acceptance/recovery facts.
2. Pin the installed Alpha.30 package version and integrity, application revision, and harness revision. If later main code is used, label it as a development candidate instead.
3. Inspect the current Provider request, response, effort, usage, cancellation, and sandbox contracts; test supported behavior without model generation where possible.
4. Choose one supported model configuration for both process arms. Keep a model comparison as a separate experiment. Historical Terra results are context, not proof that a current Provider exposes that model or executes the requested effort.
5. Derive a bounded operating envelope from the selected task and retained comparable runs. Check the existing account policy and authorization before generation. This document adds no new spend or model allowance.
6. Freeze the arm assignment, retry handling, stop rules, scoring rubric, and report format before observing results. Rehearse the harness, artifact paths, and failure retention.

Stop a live run on a configured resource bound, unexpected external action, privacy exposure, or a protocol defect that prevents fair scoring. Preserve partial observations. Classify ordinary application test failures as results and count any permitted repair explicitly; do not silently restart an arm until it succeeds.

## Report and next decision

The first report must contain the scenario, exact version and revisions, both arms' outcomes, per-phase time and usage, correctness, interventions, rework, and missing observations. It must distinguish harness failure, product failure, and evidence too weak to decide.

For each finding, state the smallest proposed improvement and the verification that would show whether it helped. Reuse retained observations for offline checks when possible. Another live run is justified when it resolves a named remaining uncertainty.

After a scenario is actually observed, turn its useful steps into a short User Guide example: starting situation, repository setup, handoff, recovery, outcome, and limits. Publish only normalized, project-approved evidence; exclude private prompts, credentials, personal paths, and unrelated project content. The guide must distinguish measured behavior from suggested usage.
