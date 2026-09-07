# Independent QA

Verdict: **PASS** for the bounded guidance candidate and generation-free
two-subject readiness. This is not an experiment result or release approval.

Candidate: `3bfae21d8b2cc39df325f025b0e02f4a2ab61669`.
Parent: `c68aaf66d182b9b2d8b8003df5e5d602fc7234d7`.
Branch: `codex/context-read-scope-experiment`.
Reviewer: `agent-lulu`, Independent QA; worker
`worker-20260907154827-c47ae770`.
Environment: Darwin arm64, Node.js `24.20.0`.

The current assignments and active Work Item claim identify Lulu as Independent
QA. Developer is the distinct Identity `agent-rikku`, confirmed by assignments
and the candidate handoff. The effective workflow is Standard. This review used
the candidate source in place with concurrent organization/evidence changes
preserved; it made no implementation, canonical-state or live-model changes.

## Independently observed evidence

- The delivery-entry suite passed all six tests: zero failures, skips or
  cancellations; elapsed time 10,551.145667 ms. These exercise actual compact CLI
  guidance, no-write behavior, authority drift, unreadable sources, wrong-owner
  routing, terminal state, invalid input, pending delivery and candidate/evidence
  freshness after review rework.
- The complete production module becomes byte-identical to its parent after
  replacing only the `read_policy` string. The source diff adds exactly one
  replacement string; the test diff adds six assertions. The installed experiment
  copy of that module is byte-identical to the reviewed source.
- The protocol digest, computed with the runner's canonical digest convention,
  matches readiness:
  `sha256:2dd89072ebfead894a2eb614a6df2e72d3498faefc58c0197b32ba9f2c876df2`.
- Recomputed runtime bundle digest matches:
  `sha256:4c6e0aefe4b9b7743b537c47c7862f9b3768de11699a32032edb253f0d048730`.
  The protocol pins instrument digest
  `sha256:6cfb88bf9f5d94caf29ee55292af978a739526b493a9ea254e5fb70fd501583b`.
- The frozen matrix validator passes. Subjects are exactly stable then
  changed-spec, both Terra medium. Limits are 100,000 Operational Tokens and eight
  minutes per subject, 200,000 and twenty minutes aggregate; retries are zero,
  and fallback, purchase and reset are disabled.
- Both subject working trees are clean and at their frozen seed revisions:
  stable `86f532d89e99446938a51a3c6668fce21196e393`; changed-spec
  `211649e97d6b914ac6ad1ffbd6fefbab52be23ea`.
- Frozen qualification records show runtime controls passed, thread configuration
  completed without generation and server exit confirmed. Oracle qualification
  accepts current requirements and rejects stale requirements for both arms;
  record-alias qualification passed its 46 cases. Native-observation qualification
  passed nine of nine cases. Consumed approval, run and seal files were absent
  at inspection, and readiness reports no live run started.

The complete 794-test verification result at this exact behavioral candidate is
reused from [Developer verification](verification.md): exit zero, no failures,
skips or cancellations, 196,347.742541 ms. QA did not rerun or represent that full
suite as an independent execution. The focused suite is supplemental evidence.

## Counterexamples and interpretation

The inventory sentence does not waive explicit obligations. A required native or
project instruction still applies even when absent from the selected route;
bootstrap and recovery reads still apply; unreadable required material or unclear
authority still requires resolution. The new text states each boundary directly.
Hashes still cannot establish reading, and reuse still requires an already-read,
available, unchanged body. Runtime guards, references, scope, candidate, ownership,
gate requirements and warning construction are unchanged throughout the module.
The negative and rework cases in the independently executed suite remain passing.

An Agent could still ignore this text or legitimately need every listed source.
The larger guidance string is therefore a clarification to test, not proven
elimination of wasted work. Neither source inventory nor byte counts establishes
actual reading, Token savings or causal efficiency. Historical results remain
historical; the original rejection is not overwritten by later oracle evidence.

Generation-free qualification does not establish live sandbox behavior or model
compliance. The frozen records explicitly retain those limits. Execution remains
subject to fresh digest binding, runner checks, account capacity and shared-stop
rules under the current authorization. This pass supports the approved two-subject
experiment only after its execution record and ordinary lifecycle requirements
are satisfied. No retry, replacement, broader study, merge or publication follows
from this QA verdict.

References: [approved design](design.md), [generation-free readiness](readiness.md),
[verification](verification.md).
