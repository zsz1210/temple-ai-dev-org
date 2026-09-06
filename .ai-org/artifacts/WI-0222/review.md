# PR 70 independent candidate review

Reviewer: agent-lulu (Quality Evaluator), distinct from Developer agent-rikku.
Candidate: `d015004d89107de909f2ce7127c36e70179dd341`; behavioral source/test tree
matches `0c673070`. Scope: local diagnostic evidence only, no model generations,
sealed-lab writes, command-policy changes or release authority.

**Result: changes requested. Two P2 diagnostic-correctness findings block acceptance.**

## P2: Incomplete TAP results can be labeled recognized

At `scripts/delivery-observations.mjs:88-89`, completeness checks only whether any
top-level plan and fail footer exist. It never reconciles the parsed results with
the declared count. This labels omitted failure records as successfully recognized,
contradicting the explicit requirement that truncation remain partial/unknown.

Reproduction: pass each string below as `aggregatedOutput` to a completed allowed
`product-tests-node` command in `createDeliveryObserver`:

```text
TAP version 13
1..2
# fail 2
```

Actual: `status: recognized`, `failures: []`. Adding only one `not ok 1 - a` record
and its AssertionError diagnostic also produces `recognized` with one failure
while the footer still declares two. Neither should claim complete recognition.

Fix direction: validate the supported TAP subset structurally, reconcile its
results/summary, and leave contradictory or incomplete data partial/unsupported.
Do not convert absence into zero. Include missing-body, mismatched count and
truncated-diagnostic regressions.

## P2: TAP TODO records are reported as real failures

At `scripts/delivery-observations.mjs:76-85`, every `not ok` line is added to
`failures` without considering TAP directives or cancellation semantics.

Actual local Node reproduction (using `--test-reporter=tap --input-type=module -e`):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
test('skipped', { skip: true }, () => {});
test('todo', { todo: true }, () => assert.equal(1, 2));
```

Node exits **0**, declares `# fail 0`, `# skipped 1`, `# todo 1`; the observer says
`recognized` with one `AssertionError` failure. This can falsely attribute test
failure/repair work to an otherwise passing command. A cancelled unresolved test
also gives `# fail 0`, `# cancelled 1` but becomes a recognized unknown failure.
Cancellation is a non-success outcome, but it should not silently become a
different declared category. Support these categories explicitly or conservatively
mark unsupported/partial; do not blindly equate all `not ok` records with failures.

Spec reporter behavior was conservative in the same real cases: cancellation and
nested failures returned partial; skip/TODO returned recognized with zero failures.
Nested TAP reported two failures (child and parent), matching the actual footer.
Any count repair must account for these differences rather than assuming one
flat row always equals one ordinary assertion failure.

## Verification performed and positive findings

- Observer, command-policy, context-format and context-material suites: **44/44**,
  zero failures, skips or cancellations; 450.244167 ms.
- Real Node TAP/spec assertion, nested subtest, cancellation and skip/TODO cases
  were executed locally; no provider calls.
- `git diff --quiet 0c673070 d015004d -- scripts test` and `git diff --check` passed.
- The new diagnostic source/test files participate in `sourceDigest`; there is
  no changed command authorization path. Observer failures return unavailable
  rather than grant commands or alter test acceptance.
- The existing fake-provider test preserves stage outcome and Operational Tokens
  while attaching bounded metadata. Existing exit-code quality checks remain
  separate; the findings above affect explanatory telemetry, not permission.
- Static privacy review and local suite confirm only keyed identifiers, allowlisted
  error classes and bounded numbers/enums in the new fields. No raw paths, test
  labels, source bodies or error payloads are intentionally retained.
- Literal cat requires bounded exact combined-output equality; null context reuse
  rows do not count as exposure. Fresh observers do not inherit reuse history.
- File/output, source, failure and event limits exist; static symlinks, nonregular
  files, out-of-root paths and unstable boundary snapshots fail unavailable. This
  review does not certify resistance to adversarial concurrent filesystem races.

## Limits and next owner

No new full-suite claim: the parent owns integrating the independently reproduced
findings with existing 676-test evidence. No live efficiency or overhead claim.
Report-only review; source and canonical lifecycle were not edited by this worker.
Developer should repair the two TAP classification issues and add local regressions,
then obtain exact-candidate re-review before merging. No new model experiment is
needed to validate either repair.
