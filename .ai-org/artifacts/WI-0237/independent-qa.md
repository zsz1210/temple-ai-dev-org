# WI-0237 formal Independent QA

**PASS** for behavioral candidate
`e88f3274645b497b08d1a359e7617247791a25c4`. No acceptance-blocking defect was
found in this bounded offline review. This is fresh Standard Independent QA;
the earlier Test/Eval reviews remain separate evidence.

## Identity, revision and environment

- Reviewer: Lulu (`agent-lulu`), `independent_qa`, Principal `human`.
  Project assignments identify Developer Rikku (`agent-rikku`); these are
  different Agent Identities. The active membership supports Standard work.
- Claim: `claim-20260907112554-0b635e0b`; worker:
  `worker-20260907112554-6fadd16f`; runtime: `/root/wi0237_formal_qa`.
- Checkout: `temple-wi0237-reliability`, branch
  `codex/evaluation-reliability-review`; observed delivery HEAD:
  `2f13b14e109395daa3726e3f3563dab3dd42061d`.
- Node.js `v24.20.0`, npm `11.19.0`, macOS arm64, 2026-09-07 UTC.
  Existing dependency installation; no install or lockfile change.
- Before and after testing, `git diff --exit-code e88f327 -- .
  ':(exclude).ai-org'` was empty. Core policies, assignments, identities,
  collaboration and usage policy also matched. All 15 committed delivery-delta
  paths were reviewed as WI-0237 reports, lifecycle records, generated views,
  and overlap notes for WI-0190/WI-0211/WI-0234. Those three other items changed
  only coordination text and timestamps. Concurrent uncommitted changes were
  coordinator-owned organization records and generated views.

## Independent execution

Command executed in that verified environment:

```bash
node --test test/continuity-fixture.test.mjs test/continuity-delivery-contract.test.mjs test/evaluation-sequence.test.mjs test/continuity-live-runner.test.mjs
```

Exit **0**, **41 passed**, 0 failed/skipped/cancelled/todo;
`40054.163834` ms reported duration. The real installed claim/product-test/finish
control accepted the unchanged product across 46 oracle cases. Its negative
controls rejected changed product/tests, unrelated history, stale or missing
committed evidence, changed scope, arbitrary artifacts, foreign events, dirty
evidence, and all five uncommitted record deletions from R1. The default oracle
still rejected a later delivery commit without explicit opt-in.

A separate reviewer subprocess created a fresh changed-spec pair, called
`recordContinuityControl`, and accepted its intact product across 46 oracle cases.
It then used exclusive copies and `assessContinuityCandidate` with
`allowRecordDescendant:true`, plus direct protocol/decision calls:

| Additional negative control | Observed rejection |
| --- | --- |
| Delete committed capabilities view only on disk | `missing-source` |
| Replace evidence with a symlink | `unsafe-working-file` |
| Commit executable mode on product without changing bytes | `unsafe-fixture-tree` |
| Change receipt claim ID and recompute its request digest | `delivery-record-invalid` |
| Retired v1, v2, v3 protocols, each with its matching digest | `frozen-protocol-mismatch` (3 controls) |
| v4 continuation-policy change with matching digest | `continuation-policy-mismatch`; no consumption record |
| Operational Tokens -1, 0.5, or 9007199254740992 | `shared-validity-unconfirmed` (3 controls) |

Subprocess exit **0**: **1 positive control and 11/11 negative controls**,
`5526.207875` ms. Synthetic product/delivery revisions were respectively
`ee0ae63ae864cfe2672c2532f5d9b43539d28999` and
`ce4f04cee08f6e8e6c99716be70f652870f19fd8`; these are test inputs, not the
repository candidate. The first subprocess exited 1 because QA expected mode
drift to reach `delivery-source-drift`; the implementation rejected it earlier
as `unsafe-fixture-tree`. Only the corrected, fully captured rerun is counted.
Temporary fixtures were removed; no user data was removed.

## Acceptance and evidence limits

- Source inspection confirmed native orchestration calls the shared typed
  decision helper after candidate, usage and cleanup validation; invalid
  revisions/source, unknown accounting and uncertain cleanup cannot continue.
  The suite exercised retained failure cost, dependency skips, authorized local
  continuation, cancellation and mandatory shared stops. Preparation uses the
  same real record control; this review did not run provider-backed preparation.
- Native wrapper tests passed 42 format/category combinations plus editing,
  compound, substitution, duplicate-event and absent-output controls. A separate
  direct call to `qualifyNativeObservations()` passed **9/9**. Its output retained
  `runtime_coverage:not-measured` and `per_command_tokens:not-observed`, with no
  raw data or generation. These are synthetic format checks, not live coverage.
- The fresh body-free input audit reproduced 27,200 instruction bytes, 1,400
  product-fact bytes, 74,626 selected-body bytes, 103,664 optional-entry JSON
  bytes, 4,827 compact-navigation JSON bytes, and 20,526 lock bytes. It reported
  no mutation/generation and null provider Tokens, read sequence and treatment
  effect. These inventories support investigation, not causal savings claims.
- Git comparison with `f61f755d` confirmed unchanged WI-0234/WI-0236 artifacts
  and historical adapter. The original [failed review](independent-review.md)
  is unchanged and remains a failure of `3cb439c55edf213acab9a144e6791a7109ec00fb`.
  R1 is a real source/test correction, not a relabeling of that review.
- Complete verification is explicitly **Developer evidence** from
  [verification-r1.md](verification-r1.md): `npm run verify`, exit 0,
  **763/763**, Node.js 24.20.0, `168762.120917` ms. It is reused under the testing
  policy after the behavioral equality checks above; this reviewer did not
  independently rerun the full suite. Focused counts are not full verification.
- The [approved design](design.md) allows stopping when no justified treatment
  exists. The [report](report.md) documents that outcome and a no-go for another
  live comparison. Nothing observed here establishes improved efficiency,
  statistical significance, live qualification or production readiness.

No source/test repair or model experiment was performed. Reviewer writes are
this report and the named worker's pinned-CLI status only. The coordinator owns
handoff, claim release, final organization checks and Release Gate assessment;
this PASS does not itself perform those operations or authorize publication.
