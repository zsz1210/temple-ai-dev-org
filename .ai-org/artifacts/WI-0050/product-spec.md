# Product specification: Temple effectiveness and multi-repository validation

## Problem

Temple has implemented organization, lifecycle, retrieval, federation, telemetry, and human-facing Workspace capabilities. Most evidence is deterministic and local, however. That proves behavior under controlled fixtures; it does not prove that the framework reduces coordination effort, recovers context efficiently, or improves outcomes in a realistic multi-repository project.

Without a predeclared experiment, normal development would mix product learning, instrumentation debugging, task difficulty, model choice, and framework effects. A resulting number could look precise while proving very little.

## Intended users of the evidence

- A solo developer deciding whether Temple reduces the cost of coordinating several AI tasks.
- A small team deciding whether repository state, roles, handoffs, and QA remain understandable across contributors.
- An enterprise engineering lead evaluating whether repository-local authority and cross-service coordination can coexist.
- A Temple maintainer deciding which context, task, telemetry, or model-routing behavior to improve next.

## Experiment outcome

Create a reproducible, local-first validation program for a small fictional commerce system with one coordination repository and three authoritative service repositories:

- Catalog owns product and availability contracts.
- Orders owns order creation and order-state behavior.
- Notifications consumes order events and owns delivery behavior.
- The coordinator owns the cross-service Initiative, domain map, contract index, experiment protocol, and read-only portfolio only.

The program must reveal both successful coordination and observable failure. It is not a polished demo whose only acceptable result is success.

## Questions the program must answer

1. Can a new Codex task recover the correct responsibility, specification, dependencies, and next action from repository evidence without reading old chat?
2. Can several repository-local Work Items coordinate one contract change without creating a central mutable lifecycle authority?
3. Can Temple detect affected-path overlap, stale revisions, wrong-repository work, missing participants, and invalid task correlation before those conditions disappear into chat?
4. Can the project attribute provider-reported Token usage and model configuration to exact accepted Work Items without storing prompts, reasoning, secrets, or source bodies?
5. Can an observer distinguish useful design or QA consumption from retry, context, conflict, or abandoned-attempt waste?
6. Can the same operating model remain understandable when executed sequentially on one machine and later extended to multiple humans, machines, pull requests, and hosted CI?

## Evidence levels and permitted claims

| Level | Minimum evidence | Permitted statement | Prohibited statement |
|---|---|---|---|
| Instrumentation pilot | One end-to-end registered task with exact correlation and a retained observation or explicit unsupported result | The measurement path is available, partial, or unavailable in this environment. | Temple saves Tokens, time, cost, or defects. |
| Local multi-repository rehearsal | Four local repositories, exact revisions, cross-service contracts, failure injections, and accepted closeout records | The bounded local scenario passed, failed, or remained unknown at named boundaries. | Enterprise collaboration, distributed claim safety, hosted CI savings, or production readiness. |
| Longitudinal observation | At least ten correctly correlated completed Work Items across at least two task shapes and known models | Observed usage drivers and descriptive differences for this sample. | One model is better, automatic routing is safe, or Temple caused the difference. |
| Matched effectiveness evaluation | Predeclared comparable tasks, controlled model/reasoning settings, accepted outcomes, repetitions, and uncertainty reporting | A bounded measured difference for the tested scenarios. | Universal savings, monetary ROI without approved prices, or applicability outside the sampled conditions. |
| Collaborative qualification | Multiple Human Principals, independently administered environments, protected Git hosting, review, CI, conflicts, and exact-revision QA | The named collaborative scenario met its criteria. | Organization-wide or regulated-enterprise qualification beyond the tested topology. |

## Required task variety

The later execution must complete at least ten Work Items and cover more than repetitive coding tasks. The set must include product specification, architecture or contract design, service implementation, integration, testing, Independent QA, failure recovery, and cold-task context recovery. A task contributes to Token qualification only when its exact Work Item/task pair, revision, Position, task shape, model, total Token delta, terminal task state, and accepted Work Item outcome are known.

## User-visible result

At the end of a later execution, the human owner receives:

- a read-only portfolio showing each repository and any stale, missing, or unknown participant;
- a Work Item and contract rollout view with exact authoritative links;
- a measurement report grouped by Work Item, Position, lifecycle stage, task shape, model, and outcome;
- a comparison report that labels descriptive observation separately from matched evidence;
- a failure and limitation register, including missing telemetry and experiment overhead;
- a concise decision: continue measurement, revise the framework, or stop the experiment.

The current `WI-0050` delivers only the reviewed plan for those results.

## Safety and authority requirements

- Use synthetic content only; no company source, customer data, credentials, production endpoints, or personal information.
- Retain numeric usage and bounded identifiers, never raw prompts, hidden reasoning, command output, source bodies, or full tool payloads.
- Keep every service repository authoritative for its own `.ai-org/` lifecycle and evidence.
- Keep the coordinator read-only toward participant lifecycle state.
- Use exact project and Work Item references; never assume a bare Work Item ID is globally unique.
- Keep Developer and Independent QA as different Agent Identities for every accepted candidate.
- Treat missing data as `unknown`, never as zero or success.
- Require explicit approval before real Codex task creation, material model usage, external Git hosting, hosted CI, multi-machine access, publication, deployment, or production activity.

## Stop conditions

Stop the later experiment and preserve evidence when any of these occurs:

- a repository would need sensitive or real production data;
- a planned cost or Token ceiling is reached;
- exact task, revision, or Work Item correlation is lost;
- the coordinator would need to mutate a participant lifecycle;
- Independent QA cannot remain identity-distinct from the Developer;
- a failure cannot be reproduced without silently editing canonical state;
- the provider cannot expose the required observation and the current phase specifically requires it;
- the owner withdraws or withholds the next approval.

Stopping is a valid result, not a reason to reconstruct missing evidence.

## Acceptance authority

The acceptance criteria in `.ai-org/work-items/WI-0050.json` govern this planning Work Item. Approval of this specification authorizes plan completion and review only. Experiment execution must be a new parent Work Item with separately approved children and budgets.

