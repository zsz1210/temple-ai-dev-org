# WI-0242 Independent QA

Decision: **PASS for report accuracy and bounded evidence preservation**.
Experiment outcome: **INCONCLUSIVE**. This pass does not accept the original
stable subject, measure changed-spec behavior, or authorize another experiment.

## Identity, candidate and environment

- Reviewer: `agent-lulu` (Lulu), Position `independent_qa`, Principal `human`.
  Current assignments name Developer `agent-rikku` and QA `agent-lulu`; they differ.
- Claim: `claim-20260907144201-10c60fa1`; worker:
  `worker-20260907144201-935fb390`, attached to `/root/wi0242_qa`.
- Exact report candidate and inspected HEAD:
  `56de97b3803c646cbaa7341c9915240615d2eece`.
- Independent checks ran on macOS arm64, Node.js `v24.20.0`. The frozen execution
  used its recorded Terra medium environment; no provider was relaunched by QA.
- This is Standard-profile evidence-only work. The reviewed files are
  [report](report.md), [comparison](comparison.json),
  [verification](verification.md) and [authorization](authorization.md).
  Only this QA artifact was written. Concurrent coordinator state was preserved.

## Independently verified evidence

Read-only Node assertions and Git checks completed with exit 0:

- Recomputed canonical `digest(JSON.parse(file))` values from the retained lab
  match both its seal and the checked-in export:
  protocol `sha256:3568e1f6ec0bf33665d0275661829a9c10c8a0ccde4b3f2fc4dfa453d2333dc2`;
  run `sha256:6b6fb0db1c0848be30d99432ed0106e642f0a613fda3a2f321b5945378ddb6be`.
  The seal timestamp is `2026-09-07T14:30:57.651Z`.
- The protocol has exactly stable then changed-spec, with the reported model,
  effort, token/time ceilings and zero-retry/no-fallback/reset/purchase envelope.
  The sealed run contains one completed subject, original
  `delivery-record-invalid` rejection and `shared-validity-unconfirmed` stop.
  Original administration completion is a separate, weaker observation.
- Exported usage, status, setup/turn/attempt times, command observations, request
  bytes, cleanup flags, model/effort, candidate and sequence decision match the
  sealed subject. Aggregate usage is 62,917 Operational Tokens, attempt elapsed
  140,862 ms and batch elapsed 141,223 ms. The run records final usage, confirmed
  server exit and empty background terminals. These are retained observations,
  not newly witnessed provider execution.
- The second actor repository remains clean at its frozen baseline. The run has
  no second subject; the report correctly preserves its missing usage/time and
  acceptance as null or unmeasured, rather than zero or a failure sample.
- Git resolves `6a1ba6b^{commit}` to
  `6a1ba6b71be2c922212a043ebe1b2f2c728d7a01`. Both recorded baseline fields use
  the short spelling. The candidate is
  `1d7a4126137a0f941f49317d316db36279ed35f4`, and delivery HEAD is
  `23ae1d786a0ed48a023abc55e193d98f62e3043c`. Both ancestry relations pass.
- A bounded record-only diagnostic evaluated the unchanged `deliveryRecords`
  function body with read-only Git access: the original checkpoint rejected;
  changing only its in-memory baseline spelling to the verified alias passed all
  41 evaluated record checks and returned seven permitted record paths. No
  product oracle, actor command, model generation or frozen-file write occurred.
  Source inspection confirms the two baseline string equalities, while the claim
  API preserves supplied revision spelling. This supports the reported reference
  representation mismatch rather than an incorrect-commit finding.
- Arithmetic independently reproduces uncached input 58,241, Operational Tokens
  62,917, provider total 525,765, cache coverage 88.8% and uncached share 92.6%.
  Retained WI-0239, WI-0236 and WI-0234 records support the listed historical
  values. Ratios round to 2.005 times Tokens and 1.735 times attempt elapsed versus
  WI-0239 ordinary; reductions versus WI-0236 Temple are 16.6% and 60.3%; the new
  observation is 2.7% below the lower WI-0234 Temple observation. Their acceptance
  qualifications and nonconcurrent provenance remain explicit.

## Reused checks and limits

The coordinator reports a separate generation-free post-hoc execution of the
existing assessor and `isolatedOracleExecutor`: 46 product cases and regression
checks passed. QA independently checked the method, source, commit identity and
unchanged seals, but did not repeat or independently witness that execution.
Treat that product pass as coordinator-observed diagnostic evidence, not a fresh
QA product test or original protocol acceptance. The report makes the original
rejection and post-hoc distinction clear.

Git comparison with instrument candidate
`afb048d10a7c1554afa75b8121d733d753b0a49b` shows only later evidence and
organization records. The unchanged behavioral inputs therefore reuse
[WI-0241 full 770/770 verification](../WI-0241/verification.md) and its distinct
[23/23 focused readiness review](../WI-0241/independent-qa.md). These tests did not
cover the newly observed baseline-alias contract case. They are not new efficacy
evidence. The coordinator owns the current packaging check; QA did not duplicate
the full or fast suite.

No blocking report-accuracy counterexample was found. The instrument defect is
real and remains unrepaired. Historical arithmetic cannot establish causation,
cost advantage, current changed-spec recovery or Learning Loop effectiveness.
Recommendations in the report are future decisions. Release Gate, lifecycle
closeout, source repair, further generation, merge and publication remain outside
this review.
