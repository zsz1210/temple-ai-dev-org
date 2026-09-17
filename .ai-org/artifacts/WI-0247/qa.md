# WI-0247 formal Independent QA

Verdict: **PASS for the bounded local diagnostic-recovery implementation** at
`e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c`. The original integrity failures F1
and F2 are resolved. D1 remains a nonblocking diagnostic-quality limitation.
This judgment permits the next governed Release Gate assessment; it is not a
merge, publication, deployment, live-recovery result, or acceptance of WI-0246.

## Identity, candidate and environment

- Independent QA: Lulu (`agent-lulu`), Position `independent_qa`, Principal
  `human`. Current `.ai-org/project/assignments.json` assigns Developer to
  `agent-rikku` and Independent QA to `agent-lulu`; these are distinct identities.
- Read-only Context confirmed Standard workflow, the candidate above and active
  claim `claim-20260917144057-b2f83b1d`. The attached runtime registry binds
  worker `worker-20260917144057-4925007e` to `/root/recovery_qa`, that claim,
  candidate, Position and identity. Attribution is self-asserted, not provider
  authentication. This is not High-Assurance qualification.
- Local environment: Darwin arm64, Node.js `v24.20.0`, 2026-09-17. HEAD was the
  exact candidate. Before and after runtime checks, `git diff --exit-code
  e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c -- src test scripts
  docs/operations/lean-finish-recovery.md` exited 0. Shared canonical and evidence
  changes were preserved. Final source check: `2026-09-17T14:42:10Z`.
- Read whole AGENTS/TEMPLE contract, temple-work Skill, parallel and assurance /
  recovery references, testing guide, resolved scope/acceptance, recovery design,
  both independent-verification records, full-verification and evaluation. Reviewed
  corrected source/diff, receipt validation, diagnostic-state reading and operator
  contract. No implementation or canonical state was repaired by this QA worker.

## Independent runtime observation and reused evidence

Fresh command executed under this formal QA assignment:

```text
node --test --test-name-pattern='Recovery binds scope|Crash resume rejects' test/lean-finish-recovery.test.mjs
```

Exit 0; **2 tests passed**, 0 failed/cancelled/skipped/todo; runner duration
`3,854.733291 ms`. These disposable-fixture checks attempted narrowed product
scope, removed/altered input hashes and recomputed local plan digests against the
unchanged receipt; they also attempted failed/malformed crash diagnostics, warning
and failure evidence, changed original bindings/status, acceptance and timestamp.
All were rejected. Valid crash resume passed, and subsequent artifact tampering
remained invalid even after its local hash was updated. Fixture cleanup was owned
by the existing test hooks; no live WI-0246 recovery was executed.

The following exact-candidate measurements are explicitly reused, not represented
as additional runs by this formal QA runtime:

- [Corrected independent Test evidence](independent-verification-v2.md): 13
  focused tests passed, plus independent valid unrelated-worker full apply with
  37 clean Doctor checks, further receipt-digest attack rejection and two passing
  fail-closed persistence checks. Its initial additional harness had one failing
  error-message expectation; that result and its explanation remain preserved.
- [Full offline evidence](full-verification.md): parent-run `npm run verify`,
  Node.js v24.20.0, exit 0, 1,266 passing tests across 121 files and clean
  repository, Markdown-link and package-boundary checks. The earlier rejected
  candidate's full result is not used to qualify this candidate.
- [Evaluation](evaluation.md) supplies the separate Test-adequacy assessment.
  The parent owns final `verify:fast` for the resulting evidence/administrative
  updates; this report does not claim that future integration check has run.

## Acceptance judgment

| Required behavior | Independent QA judgment |
| --- | --- |
| Read-only preview, explicit approval and current fingerprint | PASS. Existing byte-comparison/CLI tests and stale/mid-diagnostic mutation checks establish the contract; source rechecks the fingerprint after diagnostics and before settlement. |
| Changed product, incompatible authority, forged receipt, altered lifecycle and stale inputs reject | PASS. The original plan is now recomputed from request, inputs, output paths and scope, then bound through the canonical receipt. Fresh attack regressions and independently recorded recomputed-result attack reject. Current actor, product Git/working state, exact lifecycle outputs and protected authority remain checked. |
| Preserve journal/history and never grant acceptance | PASS. Recovery writes separate evidence and retains original failed diagnostics. Positive independent fixtures preserve prior non-view canonical bytes; replay stays historical. Both acceptance and authority remain false. |
| Safe unrelated runtime drift | PASS within the documented scope. Candidate Git bytes must match the original input digest; target entries and registry metadata/global definitions stay exact. The valid unrelated-worker apply passes current Doctor. Full successful unrelated-reservation apply is not separately established. |
| Exact full qualification and distinct review | PASS for Standard local QA. Exact full evidence is retained and independently assessed; fresh targeted runtime checks were executed under agent-lulu, distinct from Developer. |

The corrected implementation and evidence are adequate for this bounded file/Git
recovery contract. No new blocking counterexample was found in the reviewed scope.
Local digests provide consistency, not authentication against an actor able to
rewrite all canonical and local state.

## Retained limitation and boundary

D1: a malformed unrelated worker lacking `resource_reservation_ids` reaches the
status renderer and throws a raw TypeError before Doctor. The independent
persistence probes demonstrate no settled recovery artifact, unchanged original
diagnostic record and unchanged lifecycle bytes. The result fails closed, so D1
does not defeat the acceptance or integrity contract. Actionable error reporting
can be addressed in a separate scoped cycle; QA made no repair.

No browser, provider/model experiment, cross-machine recovery, live WI-0246 apply,
WI-0246 verification/acceptance, merge or release was performed. Next owner is the
parent/Release Manager to join this exact QA evidence and perform only authorized
integration and subsequent recovery work. This worker stops at its QA report.
