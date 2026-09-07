# Independent report review

Verdict: **PASS for report integrity**. The two-condition experiment remains
inconclusive; this verdict establishes neither accepted experimental delivery nor
an efficiency improvement. No material report defect was found.

Report candidate: `22161f970bf7cc62403e0fca391b11efc27431d7`.
Behavioral candidate: `3bfae21d8b2cc39df325f025b0e02f4a2ab61669`.
Branch: `codex/context-read-scope-experiment`.
Reviewer: `agent-lulu`, Independent QA; worker
`worker-20260907160727-059410ae`.
Environment: Darwin arm64, Node.js `24.20.0`.

Assignments, the active claim and runtime-worker record identify Lulu as this
reviewer. Developer is the distinct Identity `agent-rikku`, also recorded in the
candidate handoff. The effective workflow and risk tier are Standard. Concurrent
organization changes were preserved; the reviewed report, comparison and
verification files matched the exact report candidate during inspection.

## Independently checked evidence

Read-only assertions against retained lab `temple-continuity-live-RlBOEL` passed:

- Canonical recursively sorted JSON digests match both the seal and exported
  provenance: protocol
  `sha256:2dd89072ebfead894a2eb614a6df2e72d3498faefc58c0197b32ba9f2c876df2`;
  run `sha256:2a189662c3726e49363c1921e522f8d6243cc52114cb3dce5c93178e8354d91f`.
  The consumed approval cites that protocol. Its two subjects, order, Terra
  medium configuration, ceilings and disabled retry/fallback/purchase/reset
  fields match authorization and the export.
- Every exported original-result field matches the sealed run, including usage,
  request-byte observations, command counters, cleanup, administration and stop
  flags. Stable usage is 92,874 Operational Tokens; attempt time is 476,431 ms
  and batch time 476,935 ms. Input minus cached input plus output reproduces
  Operational Tokens; setup plus turn reproduces attempt time. The second row
  correctly remains not-run with null acceptance, usage and elapsed time.
- The original oracle rejection remains `delivery-source-drift`, followed by
  `shared-validity-unconfirmed`. The product candidate is
  `42177d33755a8c841cedce9533747d9f32e7cc03`; final delivery is
  `4e6aa0f2aac6d7644ff9422552868701dc82d0cf`. Git inspection confirms a clean
  final actor tree and no product/test changes between these revisions.
  `.ai-org/project/evidence.json` is the sole changed path outside the frozen
  delivery-record allowlist.
- The registry contains exactly two new entries, Git revision and Test. The
  event stream contains two evidence registrations. The finish receipt cites
  the local test-observation artifact, not either normalized Evidence ID; Test
  entry, exact candidate, handoff and released Developer claim are present.
- Historical numeric exports reproduce the stated rounded comparisons: 47.6%
  more Tokens and 3.38 times elapsed time versus WI-0242; 2.96 and 5.87 times
  respectively versus WI-0239 ordinary. Observed command-output bytes fell
  21.5%. All sixteen v3 unknowns are `non-literal-shell-body`, totaling 70,179
  output bytes; no command/output unavailability or stated observation limit
  explains these unknown classifications.

Git comparison from the behavioral candidate to the report candidate contains
organization/evidence changes only. The 794-test source verification and prior
WI-0245 independent review are reused from their named records. The separate
46-case product-only diagnostic is reused from [verification](verification.md),
not represented as a QA rerun or original acceptance. No full suite, product
oracle, provider turn or experiment was rerun in this report review.

## Counterexamples and limits

A product-only pass cannot repair the original delivery-scope rejection. A
completed stable attempt cannot establish changed-spec recovery or a two-subject
success rate. Historical rows have different acceptance histories and uncontrolled
cache/service conditions; their ratios are descriptive, not causal or accepted-
delivery speed estimates. The report preserves these distinctions.

WI-0239 already identified optional normalized registrations. The reading-only
intervention therefore leaves a retained action-selection/contract issue open;
it does not establish a new framework prohibition. Neither registry changes nor
smaller observed output identifies the source of Token cost. Unknown shell-body
classification does not establish wasted reading, safety, repeated tests or
model intent. The report avoids those unsupported conclusions.

This review adds only this artifact. Raw provider text and host coordinates are
excluded. Final packaging verification and lifecycle closeout remain with the
integration owner. No repair, further batch, merge or publication is authorized
by this verdict.

References: [authorization](authorization.md), [report](report.md),
[numeric export](comparison.json), [source verification](../WI-0245/verification.md),
[source QA](../WI-0245/independent-qa.md).
