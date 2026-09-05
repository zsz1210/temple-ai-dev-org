---
name: temple-work
description: Record authorized Work Item lifecycle and runtime state through the pinned CLI, or prepare a safe parallel dispatch plan. Not for status-only reporting, implementation itself, or first-time initialization.
---

# Project Delivery Work

Use `node ./templew.mjs` from the project root. Never hand-edit supported canonical state or replace a failed pinned launcher with an unversioned global CLI. This Skill records authorized work; it grants no implementation, external action, spending, or release authority. Inspection remains read-only.

## Start and route work

1. For a known Work Item, first preview `node ./templew.mjs context resolve . --work-item WI-#### --position <position> --compact --no-write --json`. Omit `--compact` for the full view. Read the Work Item and routed sources needed for this responsibility, not every discovered Skill. A candidate operation is navigation, not a passed readiness check.
2. Resolve the Position, Identity, Principal, claim, authority and Git scope. Reuse a body only if already read and still available in this session with an unchanged measured hash. `source_manifest` covers measured sources, not unselected policy or proof of reading. Read changed or missing-from-context instructions and authority; an unreadable required source blocks mutation.
3. For new work, recovery, an incomplete route, or unclear authority, read `AGENTS.md`, `TEMPLE.md` and applicable project records. `TEMPLE_BOOTSTRAP_REQUIRED` takes precedence: complete its explicit reads and read-only checks first. Use `work-item create` for new authorized work. For an authorized separate app task, use the CLI's `suggested_title` verbatim; registering a task does not create it.

## Perform the named operation

- Claim eligible work before editing; record affected paths and resolve overlaps by Work Item ID. Release ownership at handoff or abandonment.
- Use the Work Item's effective workflow profile and named gates in `.ai-org/core/workflow.json`. Do not downgrade the profile or invent evidence.
- For low-risk bounded Lean Developer Build with no interface or active runtime worker, read [Lean delivery](references/lean-delivery.md) before using `work-item deliver`. It records handoff, release and Test entry; it does not run tests or accept work.
- Otherwise use `handoff` with exact revision and evidence, release the claim, and `transition` with each required `--satisfy requirement=reference`.
- Before planning/dispatching parallel work or changing a runtime worker, read [Parallel work](references/parallel-work.md). Do not load that procedure for an ordinary sequential delivery.

## Finish or recover

- For Standard and High-Assurance, Independent QA must use a different Agent Identity from Developer and verify the exact candidate. Read [Assurance and recovery](references/assurance-and-recovery.md) for risk gates, review rework, closeout, or a failed operation.
- For eligible Lean at `test`, use `temple transition --to done` with `test_evidence` and `lean_closeout`. This is not Independent QA or a release approval. For profiles reaching `release_gate`, use `temple close` with the evidence and approval required by policy.
- Rebuild and inspect Status and run Doctor before claiming completion, reusing checks only for the unchanged scope they actually verified. Organizational closeout never deploys or publishes.
- On failure, inspect structured error code and mutation status where available. Repair only within the original authority; uncertain writes, conflicts and missing approval require investigation. Do not bypass a guard with manual JSON edits, deleted journals, profile changes or fabricated evidence.
