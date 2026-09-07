# WI-0231 — offline instrument review

Exact candidate: `ccb6dcfdf506a8342129152c935c9d389cbdb534`.
Reviewer: `agent-lulu`, Principal `human`, Quality Evaluator then Independent QA;
Developer: `agent-rikku`. Authority: [brief.md](brief.md) and its reviewed
WI-0230 design. Source/test equivalence to the candidate was checked; existing
framework source, public docs, native instructions, Skills and distribution
remain unchanged from the branch base. Recorded overlaps are resolved for this
sequential scope; no source or test is edited by the reviewer.

## Test — passed

Independently ran `node --test test/continuity-fixture.test.mjs` on the exact
candidate: **10/10 passed**, zero failed/skipped/cancelled/todo,
30089.652583 ms. Four correct candidates (two states × two arms) pass 46 oracle
cases each. Wrong thresholds and protected discount/test/spec/extra-file changes
reject symmetrically. Historical test records are actually replayed at their
recorded revisions; paired files match byte-for-byte in separate physical copies.

Additional negative controls cover wrong/base revisions, hidden dirty bytes,
untracked and unsafe files, process failure/timeout, preserved unrelated scratch,
failing added tests, test-side source mutation and inconsistent coordinator facts.
The repaired JSON transport rejects an extra undefined key, boxed number and
fake TypeError before serialization can erase their contract differences.

Full coverage is attributed, not independently rerun: [report.md](report.md)
records final `npm run verify`, 722/722 with zero failures/skips/cancellations,
190735.614834 ms, Node.js 24.20.0, package boundary 415 files. It includes the
existing first-stop/usage/revision/cleanup replays. The focused tests above do not
replace that exact-candidate full evidence.

## Eval — passed for offline product scope

Both arms inherit the same shared product history, authoritative specification,
public tests and explicit handoff. Temple's added organization records reference
those facts rather than supplying hidden answers. The stable checkpoint protects
tested discount work while shipping remains unfinished; changed-spec starts from
genuinely tested old shipping behavior and explicitly supersedes it. Neither
checkpoint claims to represent a natural interruption frequency.

The oracle binds a new current descendant candidate, checks protected committed
scope and actual disk bytes/modes independently of Git's dirty-file flags, extracts
candidate code into exclusive scratch, and compares against coordinator-side
expected answers. Own-key shape, primitive safe integers and genuine error type
are checked before transport. Added regressions must pass and extracted inputs
must remain unchanged. Bounded direct subprocess failure and scratch cleanup are
tested; no live-process containment claim follows.

The implementation consistently reports `live_ready:false`, `model_calls:0`,
`product_scope_only:true` and `live_sandbox_qualified:false`. Provider/bootstrap
integration, fair live prompts, lifecycle/handoff checks, descendant-process and
network containment, usage/privacy, frozen protocol, useful-effect thresholds
and budget authorization remain prelaunch work. Existing harness replays do not
qualify a new adapter. Preparation timing is an observation, not zero engineering
effort or model time. No takeover success, total-delivery, statistical reliability,
Token saving or Temple advantage is established.

No concrete remaining blocker was found against this bounded offline acceptance.
There is no authority to implement or launch the next experiment automatically.

## Independent QA — passed

After the supported Eval handoff, `agent-lulu` claimed Independent QA, distinct
from Developer `agent-rikku`, and reconfirmed exact candidate source/test/scope
equivalence. The prior source inspection remains applicable to these unchanged
files. The independent ten-test replay, explicit acceptance mapping and attributed
fresh full suite support this offline instrument, with no unresolved finding.
The return-key, genuine-error and boxed-number review defects are repaired and
covered by the final negative controls. Advance to Release Gate only: this is
not approval of a live adapter, experiment, integration or external release.

## Boundary

Stop at Release Gate after sequential acceptance. No live calls, account action,
policy/default change, external write, commit, push, merge, publication or closeout
is performed in this review. Preserve historical evidence and all other work.

Final compact Status confirms Release Gate, `release_manager` / `agent-mog`,
the exact candidate, no active claim and no unresolved finding. Doctor reports
36 pass, 1 known stale-parallel-plan warning, 0 fail; no dispatch used that plan.
Reviewer evidence and supported lifecycle changes remain uncommitted.
