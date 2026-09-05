---
name: temple-work
description: Mutate an initialized repository's canonical work-item, collaboration, claim, runtime-worker, resource, handoff, workflow, closeout, or Codex task state, and build or prepare parallel dispatch plans with the repository-pinned CLI. Use only when the request authorizes a lifecycle or runtime state change or asks for a dispatch plan; do not use for status-only reporting, implementation itself, or first-time initialization.
---

# Project Delivery Work

Use `node ./templew.mjs` from the project root as the version-pinned mutation boundary for supported canonical state. Do not hand-edit a work item, event stream, runtime-worker or resource registry, task registry, or generated status merely because it is faster. If the launcher cannot recover its pinned CLI, report the bootstrap failure instead of substituting an unversioned global command.

## Authority boundary

- A request to inspect, explain, diagnose, review, or report status is read-only. Use `temple status --no-write`, `temple doctor`, and repository evidence without mutating lifecycle state.
- Creating or changing a work item, handoff, transition, closeout, or task record requires an authorized target and action from the user or current work item.
- This Skill records lifecycle state; it does not authorize implementation, deployment, publication, external messages, spending, or irreversible operations.

## Start and route work

1. For a known Work Item, first preview `node ./templew.mjs context resolve . --work-item WI-#### --position <position> --no-write --json`. Read the current Work Item and only the routed sources needed for this responsibility; discovery is not authority or a requirement to invoke every suggested Skill.
2. Resolve the current Position, Human Principal, Agent Identity, Position Membership, applicable authority, and Git scope. Reuse a source body only if already read and still available in this session, with an unchanged measured hash in `source_manifest`. Its `selection_digest` covers selected sources, not unselected policy or proof of reading. Read changed, missing-from-context, or required unselected instructions and authority before mutation; an unreadable required source blocks it.
3. For new work, recovery, an incomplete route, or unclear authority, read `AGENTS.md`, `TEMPLE.md`, assignments, collaboration state, and the relevant project documents explicitly. A pending `TEMPLE_BOOTSTRAP_REQUIRED` takes precedence over the known-work shortcut: complete its named reads and read-only checks first. Create new durable work with `temple work-item create`; when a separate app task is authorized, use the CLI's `suggested_title` verbatim rather than rebuilding the title.
4. For parallel candidates, configure parent/dependencies, stage-specific Disciplines, stage-specific shared resources, base revision, affected paths, shared-contract status, integration owner, and overlap resolution that names each conflicting Work Item ID. Run `parallel check` for one item or `parallel plan --parent <id>` for a decomposed group. Treat a plan as dispatchable only while its reported preparation boundary remains valid.
5. When implementation is already authorized and the current runtime supports concurrent workers, dispatch the first fresh safe wave up to available capacity. Do not request redundant confirmation merely because several safe tasks can start. If concurrency is unavailable, execute the same wave sequentially. A plan never authorizes new scope, external writes, material cost, deployment, or irreversible action.
6. The plan creates no Codex task and no claim. Before creating each first-wave runtime, call `parallel prepare` with the planned Agent, sponsoring Principal, exact base revision, branch, optional worktree, and either `internal-subagent` or `user-task`. Preparation atomically records claim, resource reservations, and a runtime-worker reservation; create the worker only after it succeeds.
7. Attach an internal subagent with `worker attach --runtime-id`; never register it as a Codex task. Attach a separate user-owned Codex task by passing the reservation's `--worker-id` to `task register` with its stable thread or client-thread ID. The local CLI lock is not distributed; use Git hosting controls across machines.
8. The named Integration Owner joins the exact candidate revisions, verification results, and unresolved items from every Work Item in a wave. Rebuild the plan after the join before dispatching dependent work or advancing the lifecycle.
9. Use `handoff` to persist the exact input revision, completed work, evidence, unresolved items, and next Position.
10. Use the Work Item's effective workflow profile and `.ai-org/core/workflow.json` to select the next edge, with one `--satisfy requirement=reference` for every named requirement. Do not force Standard stages onto eligible Lean work, downgrade a profile, skip a required gate, or supply invented evidence.

## Finish work

- Update runtime status and evidence with `worker update`; update a separate Codex task with `task update`.
- A terminal worker releases its shared resources but does not forge lifecycle progress. Cancelling an unattached reservation may release its claim; attached or completed work retains explicit claim and handoff discipline.
- Release an active claim at handoff, abandonment, or completion so status does not retain false ownership.
- For Standard and High-Assurance, Independent QA must use a different Agent Identity from Developer, reproduce the exact candidate, and record its own evidence.
- For eligible Lean at `test`, use `temple transition --to done` with `test_evidence` and `lean_closeout`. This is not Independent QA or a release approval. For profiles reaching `release_gate`, use `temple close` with an explicit decision, tested revision, rollback plan, gate evidence, and approval record. `--approval not-required` is valid only when no policy trigger applies.
- `temple close` performs organizational closeout only. It does not deploy, publish, message externally, or grant high-risk approval.
- Rebuild and inspect `temple status`, then run `temple doctor` before claiming completion.
- A group-planning operation is complete when its generated plan is valid and fresh, every dispatch entry remains plan-only, and sequential or blocked items retain explicit reasons. It does not imply that any implementation task has started.

If the CLI rejects a transition or detects a checksum conflict, stop and report the missing evidence or conflict. Do not bypass the guard by editing canonical files manually.
