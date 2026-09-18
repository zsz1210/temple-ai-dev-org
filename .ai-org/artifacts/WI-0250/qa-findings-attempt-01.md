# Independent finding: active claim displaced by planned assignment

Rejected candidate: `41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261`.
Reviewer: `agent-lulu`, separate Codex runtime/account on the remote Mac.
Review task: `01a0b044-ef77-7f01-af96-11e93d5b2f28`.

The remote reviewer independently constructed a synthetic Build item with an
active claim owned by `agent-build` and a later plan naming `agent-other`.
Actor resolution correctly selected `agent-build`, but task readiness returned
`task_ready:false`, `TEMPLE_ACTOR_PLAN_MISMATCH`, responsible actor `agent-other`
and next operation `resolve-task-blockers`. The reviewer's actual probe exited 0
and retained those fields. No product or canonical files were changed by the probe.

This contradicts active-claim continuity and misdirects an existing owner. Treat
the nine supplied passing cases and 1,288 full-suite passes as insufficient for
this combined case. Same-scope repair: apply the planned-owner blocker only before
a claim exists; preserve the different plan as visible non-blocking information.
Add the combined case to the existing readiness regression and requalify.

The remote reviewer is separately completing measurement and package checks;
this finding records its actual reproduced defect, not a final acceptance claim.
