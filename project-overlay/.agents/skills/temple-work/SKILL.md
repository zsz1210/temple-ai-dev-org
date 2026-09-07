---
name: temple-work
description: Record authorized Work Item lifecycle, ownership and runtime changes with the pinned CLI. Use for handoff, verification or closeout records and safe dispatch preparation; not implementation, status-only reporting or first initialization.
---

# Project Delivery Work

Follow the whole `TEMPLE.md` contract and native instructions. This Skill grants
no authority. Use `node ./templew.mjs`; do not hand-edit supported canonical state
or replace a failed pinned launcher. Navigation and read/reuse rules are in
`AGENTS.md` and `TEMPLE.md`, not repeated here.

## Select the operation

| Operation | Procedure |
| --- | --- |
| Eligible low-risk bounded Lean Build/Test, no UI or active workers | Read [Lean execution](references/lean-execution.md) for optional entry and one `work-item finish`. Or, for Developer administration only, read [Lean delivery](references/lean-delivery.md) and choose `deliver`. Never perform both. |
| Other authorized lifecycle work | Claim eligible ownership; use `handoff` with exact revision/evidence, release, then `transition` with each required `--satisfy requirement=reference` from the effective workflow. |
| Governed dispatch/runtime mutation | Read [Parallel work](references/parallel-work.md); sequential delivery does not require parallel preparation. |
| Authorized informational delegation | Read [Read-only support](references/read-only-support.md); unmet eligibility uses the governed route, never a renamed worker. |
| High-Assurance, failed operation/review, pending recovery or Release Gate | Read [Assurance and recovery](references/assurance-and-recovery.md). |

For new/recovered work resolve authority and bootstrap before `work-item create` or
mutation. Scope claims with affected paths and coordinate named overlaps first.
Discovery, a candidate operation and a prepared plan do not grant authority.

## Finish the assigned stage

- Developer evidence must name the exact tested candidate. Verification supplies
  its own judgment; Standard/High-Assurance Independent QA differs from Developer.
  One evidence record may satisfy several named requirements by reference. Use the
  generated handoff once; put actual defects in unresolved and unperformed next-
  owner work in its next action. Do not call later stages complete.
- After canonical changes inspect Status and Doctor. Prefer `status --compact
  --json --work-item WI-####` and `doctor --compact`. Successful `finish` already
  returns these diagnostics: inspect mutation and diagnostics separately and reuse
  only for unchanged scope. Failed diagnostics remain unresolved after a lifecycle
  write; historical receipts are not fresh verification. Mandatory project tests remain required.
- At eligible Lean Test, `transition --to done` requires `test_evidence` and
  `lean_closeout`; it is not Independent QA or release. At `release_gate`, use
  `close` with exact evidence, rollback and required approval under the assurance
  reference. Organizational acceptance never publishes or deploys.

On failure, inspect structured code, mutation status and next action where available.
Correct only within existing scope; uncertain writes, conflicts or missing approval
require investigation. Do not bypass with manual JSON, deleted journals, changed
profiles or invented evidence. Stop at the recorded stage and next owner.
