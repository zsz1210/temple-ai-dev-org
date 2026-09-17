# WI-0247 independent Test verification, corrected candidate

Verdict: **PASS for the bounded Test slice**, with one nonblocking diagnostic-quality
finding below. Prior integrity failures F1 and F2 are resolved on this candidate.
This is an independent Test judgment and test-adequacy assessment, not formal
Independent QA, acceptance, release approval, or authorization for live recovery.

## Provenance

- Exact Developer candidate: `e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c`, branch
  `codex/readme-alpha33-onboarding`; Developer `agent-rikku`.
- Verifier: Lulu (`agent-lulu`), Position `quality_evaluator`, Principal `human`.
  Read-only Context resolved the active claim
  `claim-20260917143352-94c4ccc3`, candidate, and Standard Test responsibility.
  Prepared worker: `worker-20260917143352-7f0e49e3`; parent administers its runtime.
  Developer and verifier identities differ. Actor attribution is self-asserted,
  not provider authentication.
- Runtime: local macOS, Node.js `v24.20.0`, 2026-09-17; final source inspection at
  `2026-09-17T14:38:45Z`. All independent mutation scenarios used disposable
  repository fixtures, cleaned by the existing fixture cleanup hooks.
- `git rev-parse HEAD` confirmed the candidate. Before and after runtime checks,
  candidate diffs for source, tests, scripts, and the recovery guide were empty.
  Shared organization administration was preserved; this worker writes only this
  report. `git diff --check` passed before report creation.
- Read whole AGENTS/TEMPLE contract, temple-work Skill, parallel and assurance /
  recovery references, High-Assurance policy, testing guide, current Context,
  recovery design, prior failed verification, and corrected Developer evidence.
  Effective workflow is Standard; no High-Assurance qualification is inferred.
- Reviewed recovery and diagnostic-state modules, original receipt validation,
  CLI dispatch and option whitelist, supplied tests, operator guide, registry
  validation and status/Doctor integration, and package ceiling (444 to 446).

## Actual executed checks

1. `node --test test/lean-finish-recovery.test.mjs`: exit 0, **13 passed,
   0 failed/cancelled/skipped/todo**, duration `46,445.814333 ms`.
   These exercise actual recovery modules and representative subprocess CLI
   behavior against isolated repositories, not source-text assertions alone.
2. Independent `node --input-type=module` stdin harness registered three Node
   tests using the existing `cachedFixture`, actual finish/recovery functions,
   project lock, CLI-created unrelated Work Item and claim, and registry validator.
   **Two passed, one failed**, exit 1, `6,440.691292 ms`. The failed assertion
   expected a Doctor error but received a status-rendering TypeError; it was not
   an accepted recovery or an integrity bypass. The exact finding and follow-up
   are retained below rather than relabeling this run as wholly passing.
3. A separate independent two-test harness checked both malformed-registry error
   paths and post-error persistence: exit 0, **2 passed, 0 failed**,
   `2,698.558 ms`. Each asserted unchanged original diagnostic record, unchanged
   prior non-view canonical bytes, and absence of a recovery artifact.
4. Parent-run full offline qualification was read from
   [full-verification.md](full-verification.md): exact same candidate and Node
   runtime, `npm run verify` exit 0, **1,266 passed across 121 test files**,
   0 failed/cancelled/skipped/todo; repository, Markdown links and package boundary
   passed. Runner duration `314,404.307625 ms`. This is attributed parent evidence,
   not a second full suite executed by this verifier.
5. After writing this report, `git diff --check` and `npm run verify:fast`
   passed: repository, documentation-link and 446-file package checks, followed
   by **58 fast tests passed, 0 failed**, duration `1,987.468458 ms`.

Independent positive runtime output:

```json
{"scenario":"valid-unrelated-worker-full-apply","status":"reconciled","doctor":{"pass":37,"warn":0,"fail":0},"acceptance":false,"original_journal_preserved":true,"prior_canonical_files_preserved":true}
```

The harness created and claimed a separate fixture Work Item through the CLI,
released its claim, and added a schema-valid completed worker referring to that
real item and claim. The candidate Git blob proved the original empty registry.
Preview classified the change as `proven-unrelated-runtime-change` and was
read-only. Apply completed full Doctor and retained the worker registry, original
journal, original failed diagnostics, receipt, handoff, Work Items and event bytes.
Authority and acceptance were false; finish attention was empty afterward.

The additional receipt attack changed product, narrowed local journal scope, and
recomputed both the local plan digest and result digest while retaining the
canonical receipt. Preview correctly rejected it with the canonical-receipt guard.

## Acceptance and risk coverage

| Acceptance / risk | Evidence and judgment |
| --- | --- |
| Read-only preview and exact approval fingerprint | Supplied positive byte comparison, CLI fingerprint / unknown-option tests, stale approval and mid-diagnostic mutation rejection passed. Independent unrelated-worker preview also preserved canonical bytes. |
| Scope/input tampering and changed product | Original F1 variants now reject: narrowed scope, deleted/altered input hashes and locally recomputed plan digest. Independent recomputation of both local plan and result still rejects unchanged receipt. Ordinary dirty/committed product, lifecycle, actor and policy drift remain blocked. |
| Corrupt crash artifact and retained provenance | Original F2 now rejects failed/malformed diagnostics, warnings, failed checks, invalid timestamp, changed source diagnostics binding, altered original status and acceptance. Normal crash resume passes. Later corrupted reads remain invalid even if the local artifact hash is updated. |
| Unrelated registry compatibility | Full valid unrelated-worker apply passes with 37 clean Doctor checks. Supplied tests cover both worker and reservation preview compatibility, target/global drift rejection and unprovable original bytes. Invalid unrelated records cannot settle recovery. |
| No lifecycle replay or acceptance | Positive fixtures preserve original journal, failed diagnostic evidence and prior non-view canonical bytes. Historical finish replay remains historical and not ready as fresh Test evidence. |
| Full candidate regression qualification | Parent's exact-candidate 1,266-test full result plus independent focused and adversarial judgment satisfy the bounded Test assessment. Previous candidate's full result was not reused. |

The main risks are guard bypass, stale settlement, and loss or misrepresentation
of the original result. Deterministic fixture integration is appropriate for these
local file/Git contracts; representative CLI coverage checks option and lock entry.
The corrected checks and negative tests are adequate for this bounded slice.

## D1 — low, nonblocking: malformed unrelated worker produces raw renderer error

Trigger: append this unrelated entry to a valid fixture worker registry:

```json
{"work_item_id":"WI-9999","status":"completed","id":"malformed"}
```

Preview accepts the unrelated-entry difference. Apply fails in
`src/status.mjs:621` (through recovery's `writeStatus` call at
`src/lean-finish-recovery.mjs:163`) because rendering reads
`worker.resource_reservation_ids.length` before registry validation:

```text
TypeError: Cannot read properties of undefined (reading 'length')
```

Expected: actionable invalid-registry rejection. Actual: fail-closed rejection
with a raw TypeError. Follow-up independently confirmed **no recovery artifact,
unchanged original diagnostic record and unchanged lifecycle files**. Adding
`resource_reservation_ids: []` lets the same invalid entry reach Doctor, which
correctly rejects with `Recovery diagnostics are not clean; no recovery was
settled`, with the same persistence guarantees. This is a diagnostic-quality
limitation in the existing status renderer, not a recovery acceptance bypass.
No fix or scope expansion was made in this verification slice.

## Limits and next owner

Full successful unrelated **reservation** recovery was not separately executed;
its positive preview and target/global guards have focused test evidence. No live
WI-0246 recovery, provider call, paid experiment, browser, cross-machine,
deployment or release test was performed. Local SHA / receipt consistency is not
a signature against an actor able to rewrite all repository and local state.

Next owner: parent to join this Test result and the exact full-suite evidence,
then perform the separately governed Eval and formal Independent QA steps.
This worker stops at its assigned verification slice.
