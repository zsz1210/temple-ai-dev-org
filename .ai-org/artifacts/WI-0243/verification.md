# WI-0243 verification

Exact behavioral candidate: `68620faa8dc2cf766e76e7e590c85cf2b512a492`.
Changed executable scope: `scripts/continuity-fixture.mjs` and
`test/continuity-fixture.test.mjs`. No installed framework, actor instructions,
provider dispatch, envelope or old evidence changed.

## Observed checks

- Focused `node --test --test-name-pattern='baseline identity'
  test/continuity-fixture.test.mjs`: **21/21 pass**, exit 0, 14,801.693292 ms.
  Four real CLI positive cases and sixteen independently mutated negative-field
  cases are counted with the parent test. No model generation is involved.
- `npm run verify` on the exact candidate, Node.js 24.20.0: repository, links
  and package checks passed; **791/791 tests pass**, exit 0, 188,869.722916 ms.
  Zero failures, cancellations, skips or TODOs. The existing recursive node:test
  warning appeared; it is not a new ignored failure.
- Doctor after the initial canonical changes: 36 pass, one stale generated
  parallel-plan warning, zero failures. Sequential development did not dispatch
  from that plan. Formal QA needs a fresh safe plan and prepared worker.
- Original WI-0242 protocol/run/seal files matched before and after the isolated
  retained-candidate recheck. With the repaired assessor and **no checkpoint
  override**, the candidate passed 46 product cases and regression checks using
  the retained runtime's isolated command executor, Node.js 24.19.0. Two oracle
  command executions, no model turn. See [numeric record](retained-recheck.json).

The repaired evaluator resolves full commit identity and rejects ambiguity in
either baseline field, including ambiguous names whose two refs point at the
correct commit and local Git configuration disables ordinary warnings. Existing
candidate, ancestry, scope, receipt, dirty-file and product negatives also passed
in the full suite. The installed claim API remains unchanged.

## Evaluation

Developer evidence supports the bounded offline repair. The retained-case pass
is a new instrument observation, not a rewritten live result. No new efficiency
or changed-spec measurement exists. Distinct Independent QA must review the
exact candidate before organizational acceptance; Developer checks are not QA.

## Subsequent closeout

[Independent QA](independent-qa.md) accepted this exact candidate after 22/22
focused checks (28,234.353208 ms). Its machine-local worktree path was omitted
from the published record; no result or judgment changed. The reviewed repair is
[organizationally accepted](release-record.md), not merged or externally released.
Final canonical-state Doctor: 37 pass, zero warnings and failures. A later
evidence-only packaging check passed 54/54 fast tests (1,134.661042 ms); this is
not a replacement full-suite result or a new model-performance measurement.
