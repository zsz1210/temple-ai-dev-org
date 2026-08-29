---
name: temple-work
description: Mutate an initialized repository's canonical work-item, handoff, workflow, closeout, or Codex task state with the temple CLI. Use only when the request authorizes a lifecycle state change; do not use for status-only reporting, implementation itself, or first-time initialization.
---

# Project Delivery Work

Use the `temple` CLI as the mutation boundary for supported canonical state. Do not hand-edit a work item, event stream, task registry, or generated status merely because it is faster.

## Authority boundary

- A request to inspect, explain, diagnose, review, or report status is read-only. Use `temple status --no-write`, `temple doctor`, and repository evidence without mutating lifecycle state.
- Creating or changing a work item, handoff, transition, closeout, or task record requires an authorized target and action from the user or current work item.
- This Skill records lifecycle state; it does not authorize implementation, deployment, publication, external messages, spending, or irreversible operations.

## Start and route work

1. Read `AGENTS.md`, `TEMPLE.md`, the assignments, relevant project documents, and current Git state.
2. Resolve the current Position and Agent Identity. Keep Developer and Independent QA separate.
3. Create durable work with `temple work-item create`; use its suggested `WI-#### · Position · Agent Name` title when an app task is needed.
4. After the app creates the task, register its real thread or client-thread ID with `temple task register`. The CLI records task identity but never creates, renames, opens, or archives the app task by itself.
5. Use `temple handoff` to persist the exact input revision, completed work, evidence, unresolved items, and next Position.
6. Use `temple transition` with one `--satisfy requirement=reference` for every named workflow requirement. Do not skip a state or supply invented evidence.

## Finish work

- Update task status and revision with `temple task update`.
- Independent QA must reproduce the exact candidate and record its own evidence.
- At `release_gate`, use `temple close` with an explicit decision, tested revision, rollback plan, gate evidence, and approval record. `--approval not-required` is valid only when no policy trigger applies.
- `temple close` performs organizational closeout only. It does not deploy, publish, message externally, or grant high-risk approval.
- Rebuild and inspect `temple status`, then run `temple doctor` before claiming completion.

If the CLI rejects a transition or detects a checksum conflict, stop and report the missing evidence or conflict. Do not bypass the guard by editing canonical files manually.
