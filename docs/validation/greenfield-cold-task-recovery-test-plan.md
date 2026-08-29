# Greenfield cold-task recovery test plan

- Status: **planned / not run**
- Capability: Phase 1.5 greenfield continuity and Alpha.16 runtime consumption
- Evidence class: new private product repository, fresh Codex task, exact Git revisions
- Framework baseline: `0.1.0-alpha.16` at `804de31aec791546693abc8b52549f0eaf23b1ec`

## Why this test is required

FlowDeck proved greenfield initialization and one complete lifecycle, but no new Codex task recovered the product and organizational state from repository files. Alpha.16 proves deterministic group planning in local fixtures, but it does not prove that a real runtime can consume a fresh first wave, register tasks and claims, join evidence, and recover after canonical state changes.

This test closes those gaps without continuing FlowDeck or treating chat history as project memory.

## Product and stop boundary

The test uses a new, non-production product that the user intends to retain after the experiment. The product must have a real use outside framework validation, one to three locally verifiable acceptance criteria, no account or billing dependency, no production data, no external notifications, and no production deployment.

Temple validation stops when the first vertical slice reaches evidence-backed release closeout and the recovery findings are recorded. Product work after that point requires a separate product decision; passing the validation does not authorize a second feature.

## Roles

| Responsibility | Required owner |
|---|---|
| Product intent and acceptance | Product Manager with the user |
| Work decomposition and cold-task dispatch | Engineering Manager |
| Architecture and stable shared contracts | Tech Lead |
| Implementation | Developer Agent Identity |
| Wave evidence join | Named Integration Owner |
| Evaluation | Quality Evaluator |
| Exact-revision reproduction | Independent QA Agent Identity distinct from Developer |
| State and recovery observation | Observer |

The lean five-Identity organization is sufficient. Collaborative Principal and membership rules may be used, but the retained multi-human, multi-machine plan is not part of this test.

## Controls

1. Create a new private repository and initialize it from the pinned framework baseline.
2. Keep product truth, specification authority, Work Items, assignments, tasks, decisions, and evidence in the product repository.
3. The originating task may conduct discovery, establish baselines, create Work Items, and generate the first parallel plan. It must not implement the candidate that the cold task is expected to recover.
4. Start a new Codex task in a clean checkout or new projectless workspace. Its initial prompt may identify only the repository URL or path and ask it to recover and continue from canonical state.
5. Do not paste an old-chat summary, product explanation, current Work Item, intended next command, Agent name, or answer key into the cold task.
6. Record every extra hint requested or supplied. A necessary product or organizational re-explanation is a recovery failure, not an invisible rescue.
7. Register the real task or client-task ID with the Work Item. Use the suggested `Work Item ID · Position · Agent Name` title when the runtime permits naming.
8. Dispatch only the first wave of a valid, fresh plan and only when implementation is already authorized. Establish required claims before implementation.
9. After every wave, the Integration Owner records exact revisions, verification results, and unresolved items. Rebuild the plan before dependent work.
10. Independent QA reproduces the exact joined candidate in a clean checkout. No production release is performed.

## Scenario

### Stage 1: originating task

1. Capture the problem, intended user, outcomes, non-goals, risks, and experiment stop condition.
2. Initialize the organization and confirm Developer and Independent QA separation.
3. Establish the Project Charter, domain language, product requirements, UI delivery mode, technical design, and specification index.
4. Create one parent outcome and bounded child Work Items with acceptance, dependencies, base revision, affected paths, contract status, disciplines, and Integration Owner.
5. Generate and inspect `temple parallel plan`. Preserve explicit sequential and blocked reasons rather than forcing concurrency.
6. Commit and push all canonical state. End the originating task's delivery authority before implementation begins.

### Stage 2: cold-task recovery

1. Clone or open the repository without receiving the originating conversation.
2. Read repository instructions, then run read-only doctor, status, capability discovery, and context resolution.
3. Before changing files, report the product purpose, current lifecycle state, assigned Position and Agent, active or next Work Item, acceptance criteria, affected paths, dependencies, plan freshness, next safe wave, unresolved items, and required approval.
4. Register the task and record its exact starting revision.
5. If the report is materially wrong or requires old-chat facts, stop implementation and preserve the failure evidence.

### Stage 3: execution and join

1. Consume only the first fresh safe wave. Use concurrent workers only for naturally independent items and within actual runtime capacity; otherwise preserve the wave and execute sequentially.
2. Each implementation task claims its Work Item when required, uses a distinct branch or worktree where applicable, and records tests and candidate revision.
3. The Integration Owner joins the candidates, resolves or records conflicts, runs integration verification, and causes the old plan to become stale through canonical updates.
4. Confirm that stale-plan observation works, then rebuild before any dependent wave.

### Stage 4: independent verification and closeout

1. Quality Evaluator checks acceptance and product behavior.
2. Independent QA reproduces the exact joined revision from a clean checkout and records its own evidence.
3. Complete the release gate without deploying or publishing.
4. Archive-ready tasks are identified from canonical state.
5. Record the retrospective as evidence first; promote a Lesson or Practice only when the Engineering Learning contract supports it.

## Pass criteria

- The cold task identifies the product, current state, next bounded work, ownership, acceptance, dependencies, and risks without reading the originating chat.
- The user does not manually reconstruct Positions, Assignments, handoffs, task mappings, or product intent.
- Every real task has a stable registered ID, Work Item relationship, starting revision, and observable status.
- A valid fresh plan controls dispatch; no sequential or blocked item is silently parallelized.
- If two items execute concurrently, they do not lose canonical records or overwrite each other's scope. If no natural concurrency exists, the sequential fallback is explicitly recorded and does not fail the recovery test.
- Integration evidence identifies exact candidate revisions, verification, unresolved items, and the responsible Integration Owner.
- A canonical change makes the old plan stale and the next dispatch uses a rebuilt plan.
- Developer and Independent QA remain distinct and verify the same joined revision.
- `temple doctor` has no failures at closeout, and `temple status` agrees with Git and task evidence.
- The first vertical slice closes without production deployment, and Temple validation stops at the declared boundary.

## Failure conditions

- The cold task needs a pasted chat summary or asks the user to redefine the product or organization.
- Repository sources disagree and the task silently chooses one without recording the conflict.
- An unregistered task, unclaimed collaborative Work Item, stale plan, wrong revision, or missing Integration Owner is treated as valid delivery evidence.
- Concurrent work loses a Work Item, overwrites an unrelated path, bypasses a dependency, or merges without a recorded join.
- Independent QA tests a different revision or shares the Developer Agent Identity.
- The pilot expands into another feature merely because the first slice passed.

## Evidence to retain

- Repository URL and visibility, framework and product revisions, environment, and timestamps.
- Initial cold-task prompt, task ID, title, starting revision, and first recovery report.
- Doctor, status, Context Capsule, Capability Registry, and parallel-plan outputs before implementation.
- Work Item claims, branches or worktrees, pull requests when used, tests, candidate revisions, join evidence, stale-plan observation, rebuilt plan, QA evidence, and closeout record.
- Every additional hint, rejected action, conflict, failure, rollback, and unresolved item.
- A final immutable validation record that states `passed`, `failed`, or `passed_with_limits` and does not generalize beyond the observed environment.

## Explicit exclusions

- No continuation of FlowDeck.
- No production release, external tracker write, RAG installation, custom pack promotion, or High-Assurance claim.
- No claim that one user and one machine satisfy the retained multi-human, multi-machine validation.
- No automatic Alpha.17 feature selection before the retrospective identifies the actual limiting failure.
