# WI-0237 Quality Evaluation review

Outcome: **FAIL — candidate requires the bounded correction below.** The existing
focused suite passes, but independent deletion controls violate the explicit
record-descendant acceptance contract. This finishes the assigned Test review;
it is not formal Independent QA, Eval acceptance, or release approval.

## Identity and provenance

- Reviewer: Lulu (`agent-lulu`), `quality_evaluator`, Principal `human`, resolved
  from the project assignments and WI-0237's active Test claim.
- Candidate: `3cb439c55edf213acab9a144e6791a7109ec00fb`; comparison base:
  `f61f755d`. Worktree: `temple-wi0237-reliability`.
- Worker: `worker-20260907110114-8bf60e41`; claim:
  `claim-20260907110114-f78d7cd7`. Worker completion means review completion,
  not a passing candidate. Claim and lifecycle remain with the coordinator.
- Runtime: Node.js `v24.20.0`, macOS, `/opt/homebrew/bin/node`, 2026-09-07 UTC.
- `git rev-parse HEAD` and the diff from the candidate confirmed unchanged
  behavioral source/tests before and after verification. Concurrent changes were
  canonical bookkeeping, generated views, and the coordinator's report addition.
  No reviewer source/test edit, install, commit, merge, or provider run occurred.

## Confirmed finding

**R1 — Medium, acceptance-blocking: uncommitted deleted delivery records pass the
new exact-candidate oracle.**

At `scripts/continuity-fixture.mjs:268`, the final presence check still iterates
the product tree and skips every bookkeeping path. The preceding filesystem walk
only sees existing files. Meanwhile `deliveryRecords` reads the delivery commit,
so a record present in Git but deleted on disk bypasses both checks.

An independent subprocess imported the candidate's fixture helpers and created a
fresh `changed-spec` pair, then ran `recordContinuityControl(pair)`. That control
used the actual pinned claim, product-test, and finish CLI and committed its
delivery records. The intact control passed all 46 oracle cases. Three exclusive
copies were then tested after `fs.unlink` removed one file from each working tree,
without committing the deletion:

| Deleted working-tree path | Expected | Actual |
| --- | --- | --- |
| `.ai-org/artifacts/WI-0001/test-evidence.json` | Reject absent evidence | `passed: true`, `reason: accepted` |
| `.ai-org/work-items/WI-0001.json` | Reject absent canonical item | `passed: true`, `reason: accepted` |
| `.ai-org/events/events.jsonl` | Reject absent event record | `passed: true`, `reason: accepted` |

All calls used
`assessContinuityCandidate(copy, pair, 'temple', control.revision, {allowRecordDescendant:true})`.
The synthetic product SHA was `e4ebca20e940d9d07df802933192cba6d64c2eba`; delivery
SHA was `ae06192c07490f5b5ac67f457be2ae8c08fe65f0`. The evaluator subprocess exited
0 because it recorded the observed counterexamples; these three negative controls
are failures, not passing tests. Its exclusively created temporary fixtures were
removed after inspection; no user data was removed.

The missing-evidence case can also survive the runner's later Work Item reread,
allowing an apparently accepted sample despite absent current evidence. A missing
Work Item is additionally caught by that later reread, but the direct oracle still
misclassifies it. This contradicts acceptance criterion 1 and the report's claim
that dirty or missing records fail.

Required correction: when record-descendant mode is active, require presence of
every file in the final delivery tree, including newly added evidence, receipt,
handoff, Work Item, and events. Keep the legacy exact-HEAD default behavior intact.
Add uncommitted-deletion controls for these cases and verify a new exact candidate.
No broader framework or workflow redesign is required for this finding.

## Passing evidence and its limits

Independent command:

```bash
node --test test/continuity-fixture.test.mjs test/continuity-delivery-contract.test.mjs test/evaluation-sequence.test.mjs test/continuity-live-runner.test.mjs
```

Result: exit 0, **41 passed, 0 failed, 0 skipped, 0 cancelled**,
`35167.716417` ms reported duration. These tests exercised real temporary Git/CLI
fixtures, deterministic oracle execution, and simulated provider events. They
are offline runtime evidence; they do not prove a live provider route.

- The real claim/finish control accepted the unchanged product while the legacy
  default rejected a later record commit. Existing negative controls rejected
  committed product/test drift, missing or stale committed evidence, changed
  scope, unrelated history, arbitrary artifacts, another item's event suffix,
  and modified existing working-tree evidence. R1 identifies the omitted deletion
  branch rather than invalidating these observed passes.
- Native literal observations passed supported wrappers and categories, compound
  and substitution rejection, editing forms, duplicate events, unavailable output,
  output caps, and absence of raw command/output in aggregates. The shared
  preparation helper has 9 synthetic cases; the unit wrapper corpus has 42
  combinations. Neither establishes native-session coverage or per-command Tokens.
- Shared typed decisions passed authorized local failure continuation, denied
  continuation, dependency skips, retained cost, and mandatory stops on unknown
  runtime/accounting/cleanup/source validity. Inspection confirmed the native
  runner calls the shared helper and version 4 rejects retired approvals.
- Inspection confirmed preparation uses the same real record control and gates
  on its product/delivery result. This review did not execute provider-backed
  preparation or claim live qualification.
- The body-free input audit reproduced the reported `27200` operating instruction
  bytes, `1400` product-fact bytes, `74626` selected-body bytes, `103664` optional
  entry JSON bytes, `4827` compact navigation JSON bytes, and `20526` lock bytes.
  It reported no mutation, generation, provider Tokens, actual read sequence, or
  treatment effect. The report correctly distinguishes these surfaces and makes
  no efficiency claim. Its no-go for a new comparison is supported.
- The Git diff from `f61f755d` showed no changes to historical WI-0234/WI-0236
  artifacts or `scripts/continuity-codex-adapter.mjs`. Frozen outcomes were not
  rescored or extended by this review.

Full verification provenance is separate: the Developer/coordinator recorded
`npm run verify`, exit 0, **763/763**, Node.js 24.20.0, `166115.362458` ms in
[Developer verification](verification.md). That full result is reused for the
unchanged behavioral candidate under the testing policy; this reviewer did not
independently rerun the full suite. It does not override R1. Any behavioral fix
requires a new full verification result and exact-revision review.

Next owner: Developer for R1, then Quality Evaluation to recheck the resulting
candidate. No other confirmed defect was found in this bounded review. Later
Independent QA and Release Gate remain unperformed.
