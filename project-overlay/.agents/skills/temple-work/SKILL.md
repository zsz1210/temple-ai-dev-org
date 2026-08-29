---
name: temple-work
description: Mutate an initialized repository's canonical work-item, collaboration, claim, handoff, workflow, closeout, or Codex task state, and build generated parallel dispatch plans, with the temple CLI. Use only when the request authorizes a lifecycle state change or asks for a dispatch plan; do not use for status-only reporting, implementation itself, or first-time initialization.
---

# Project Delivery Work

Use the `temple` CLI as the mutation boundary for supported canonical state. Do not hand-edit a work item, event stream, task registry, or generated status merely because it is faster.

## Authority boundary

- A request to inspect, explain, diagnose, review, or report status is read-only. Use `temple status --no-write`, `temple doctor`, and repository evidence without mutating lifecycle state.
- Creating or changing a work item, handoff, transition, closeout, or task record requires an authorized target and action from the user or current work item.
- This Skill records lifecycle state; it does not authorize implementation, deployment, publication, external messages, spending, or irreversible operations.

## Start and route work

1. Read `AGENTS.md`, `TEMPLE.md`, assignments, collaboration state, relevant project documents, and current Git state.
2. Resolve the current Position, Human Principal, Agent Identity, and Position Membership. Keep Developer and Independent QA separate.
3. Create durable work with `temple work-item create`; use its suggested `Work Item ID · Position · Agent Name` title when an app task is needed.
4. For parallel candidates, configure parent/dependencies, required Disciplines, base revision, affected paths, shared-contract status, integration owner, and overlap resolution that names each conflicting Work Item ID. Run `temple parallel check` for one item or `temple parallel plan --parent <id>` for a decomposed group. Treat the generated plan as stale after canonical inputs change.
5. When implementation is already authorized and the current runtime supports concurrent workers, dispatch the first fresh safe wave up to available capacity. Do not request redundant confirmation merely because several safe tasks can start. If concurrency is unavailable, execute the same wave sequentially. A plan never authorizes new scope, external writes, material cost, deployment, or irreversible action.
6. The plan creates no Codex task and no claim. In Collaborative mode, claim each dispatched Work Item only through an eligible Agent and sponsoring Principal, then register every real thread or client-thread ID with `temple task register`. Record branch and optional worktree. The local CLI lock is not distributed; use Git hosting controls across machines.
7. The named Integration Owner joins the exact candidate revisions, verification results, and unresolved items from every Work Item in a wave. Rebuild the plan after the join before dispatching dependent work or advancing the lifecycle.
8. Use `temple handoff` to persist the exact input revision, completed work, evidence, unresolved items, and next Position.
9. Use `temple transition` with one `--satisfy requirement=reference` for every named workflow requirement. Do not skip a state or supply invented evidence.

## Finish work

- Update task status and revision with `temple task update`.
- Release an active claim at handoff, abandonment, or completion so status does not retain false ownership.
- Independent QA must reproduce the exact candidate and record its own evidence.
- At `release_gate`, use `temple close` with an explicit decision, tested revision, rollback plan, gate evidence, and approval record. `--approval not-required` is valid only when no policy trigger applies.
- `temple close` performs organizational closeout only. It does not deploy, publish, message externally, or grant high-risk approval.
- Rebuild and inspect `temple status`, then run `temple doctor` before claiming completion.
- A group-planning operation is complete when its generated plan is valid and fresh, every dispatch entry remains plan-only, and sequential or blocked items retain explicit reasons. It does not imply that any implementation task has started.

If the CLI rejects a transition or detects a checksum conflict, stop and report the missing evidence or conflict. Do not bypass the guard by editing canonical files manually.
