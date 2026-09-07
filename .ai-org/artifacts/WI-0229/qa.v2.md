# WI-0229 — corrected-candidate Test and Independent QA

Candidate: `e9c9ade27195923efcd7f58b2735a1dace193e5a`.
Reviewer: `agent-lulu`, Principal `human`, Quality Evaluator followed by
Independent QA; Developer: `agent-rikku`. Standard workflow applies to this
framework change. [qa.md](qa.md) remains the historical rejection of `ef4f6cd3`.

## Test — passed

Current source/tests/docs/scripts/distribution equal the exact corrected candidate.
The only behavioral changes since the rejected candidate are the ownership-array
guard and its regression. The real array is now validated and exact entry paths
are excluded. The regression directly checks `managed content excluded`, so a
dirty-lock or later Doctor rejection cannot cause a false pass; malformed inventory
cases directly check the separate inventory error.

Independently ran on Node.js 24.20.0:

```text
node --test --test-name-pattern='managed, authority-indexed and non-Solo files retain ordinary verification' test/mechanical-completion.test.mjs
1 test passed; 0 failed, cancelled, skipped or todo
duration_ms: 2708.88975
```

This is the corrected regression only, not all 14 mechanical tests. The same
reviewer's previous 14/14 observations in [qa.md](qa.md) apply only to unchanged
sections; the old ownership assertion and old candidate are not accepted by reuse.
Fresh exact-candidate full coverage comes from the attributed
[Developer report.v2.md](report.v2.md): 712/712, zero failed/skipped/cancelled/todo,
175766.686709 ms. That run includes all 14 corrected mechanical tests, ordinary
Lean distinct-Verifier and recovery tests, and init/upgrade compatibility. The
temporary init → Doctor → Status → idempotent re-init case is
`test/cli.test.mjs:525`; no redundant rehearsal or full-suite rerun was performed.

No unresolved candidate finding remains in Test. The prior P2 is repaired; its
history is preserved rather than overwritten. Evaluation is recorded separately
in [evaluation.v2.md](evaluation.v2.md).

## Independent QA — passed

After the supported Eval handoff, Independent QA re-resolved current authority,
claimed as `agent-lulu` (distinct from Developer `agent-rikku`), and reconfirmed
source/test/documentation equivalence to exact candidate
`e9c9ade27195923efcd7f58b2735a1dace193e5a`. The historical rejection artifact
is unchanged. Same-scope rework retains the original authority and records the
rejected attempt; corrected evidence is separately named and revision-bound.

The acceptance mapping in evaluation.v2.md, direct independently reproduced
ownership regression, prior observations limited to unchanged code, and fresh
exact-candidate full verification support acceptance. The managed-array P2 and
earlier recovery/link/raw-byte defects have no remaining concrete blocker.
Ordinary workflow and explicit opt-in limits remain intact; this review does not
certify arbitrary notes as semantically harmless. Independent QA approves
advancement to Release Gate only, not closeout, activation or integration.

## Boundary

No source/test edit, opt-in activation, live generation, credit/reset/purchase,
external write, commit, push, merge or release was performed by this reviewer.
The sequential judgments are complete through Release Gate, owned by
`release_manager` / `agent-mog`, with no active claim or unresolved finding.
Compact Status confirms the exact candidate and non-terminal state. Doctor:
36 pass, 1 warning, 0 fail. The known generated parallel-plan staleness warning
remains; no dispatch used that plan. Evidence and lifecycle changes remain
uncommitted. No closeout was performed.
