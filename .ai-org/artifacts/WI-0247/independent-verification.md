# WI-0247 independent verification

Verdict: **FAIL — candidate needs rework.** Two independently reproduced integrity
defects violate the approved recovery design. Passing focused tests do not resolve
these failures. This record is Test evidence, not Eval, Independent QA completion,
release approval, or authorization to recover WI-0246.

## Provenance and scope

- Verifier: Lulu (`agent-lulu`), Position `quality_evaluator`, Principal `human`.
  Read-only context resolution selected the active claim
  `claim-20260917142343-2cec5fb2`; worker `worker-20260917142343-4d4c9bfe` was
  administered by the parent. Developer and verifier identities are distinct.
- Exact Developer candidate: `d7c81d8d80d7923b2cf885812f8326fa12fdaafa`, branch
  `codex/readme-alpha33-onboarding`, inspected 2026-09-17.
- Runtime: local macOS, Node.js `v24.20.0`; isolated disposable repository fixtures.
- Before checks, `git rev-parse HEAD` returned the candidate above. `git diff
  --exit-code d7c81d8 -- src/lean-finish-recovery.mjs src/lean-delivery-state.mjs
  src/cli.mjs test/lean-finish-recovery.test.mjs
  docs/operations/lean-finish-recovery.md scripts/check-package.mjs` exited 0.
  Shared organization-state changes existed and were preserved.
- Authority inspected: whole `TEMPLE.md`, temple-work Skill and its assurance and
  recovery reference, read-only WI-0247 context, approved `recovery-design.md`, and
  repository testing instructions. Effective workflow is Standard.
- Reviewed source: new recovery module, changed diagnostic-record validator, CLI
  dispatch/options, recovery tests, operator guide, and package ceiling change.
  Package ceiling changes exactly 444 to 446; no dependency or size-limit change.

## Actual runtime checks

`node --test test/lean-finish-recovery.test.mjs` exited 0: **9 tests passed,
0 failed, 0 skipped**, reported duration 27,558.074333 ms. This proves the supplied
fixture scenarios: compatible policy migration/evidence amendment/administrative
HEAD advance, read-only preview, CLI fingerprint requirement, stale evidence,
ordinary dirty and committed product drift, policy/lifecycle edits, actor/path and
worker guards, crash resume, post-settlement artifact edit detection, remaining
diagnostic failures, partial journal and invalid records. It is focused evidence;
the parent owns the required full `npm run verify` run.

Two additional independent adversarial scenarios ran through a `node
--input-type=module` stdin harness using the existing `cachedFixture`, actual
`finishLeanWorkItem`, `previewLeanFinishRecovery`, `recoverLeanFinish`, and project
mutation lock. Setup confirmed fixture integration policy, injected a
`before-doctor` failure after Developer lifecycle application, and created an
explicit fixture approval artifact. Each scenario used a fresh disposable fixture
and cleaned it through the fixture's cleanup method. The harness exited 0 because
it successfully reproduced the failures below; its imported helper reported
`tests 0`, so these are two adversarial runtime reproductions, not two passing
Node test cases. No live WI-0246 command or data mutation occurred.

## F1 — high: unbound local journal scope bypasses changed-product guard

Location: `src/lean-finish-recovery.mjs:56` and `:73`; supporting receipt validator
in `src/lean-delivery.mjs:314`.

1. Start with the fully applied failed finish fixture whose declared affected
   paths are `app.mjs` and `app.test.mjs`.
2. Append `// changed product` to `app.mjs`. Confirm ordinary recovery preview
   rejects this with `Product scope changed`.
3. Change only the local diagnostic record's `journal.affected_paths` to
   `['app.test.mjs']`, retaining the original request, journal result, canonical
   Work Item, handoff and receipt. Write through the diagnostic-state helper in
   this isolated fixture.
4. Preview and apply the returned fingerprint.

Expected: reject the altered journal because its scope no longer matches the
original receipt's plan digest and original Work Item scope.

Actual output:

```json
{"scenario":"alter-local-product-scope","status":"reconciled","acceptance":false,"receipt_unchanged":true,"attention":[],"product_dirty":true}
```

Receipt bytes were independently compared before/after and remained identical.
The original plan digest covers request, inputs, output paths and affected paths,
but the called validator does not recompute it before recovery trusts journal
scope and inputs. Hashing the currently loaded record into the new preview cannot
establish that it is the original snapshot. This also exposes the input-snapshot
binding to local journal edits, although that variant was not separately executed.
Recompute and check the original plan binding before trusting these fields; add a
regression retaining the canonical receipt while altering the local scope/inputs.

## F2 — medium: interrupted recovery trusts altered artifact diagnostics

Location: `src/lean-finish-recovery.mjs:130` and `src/lean-delivery-state.mjs:90`.

1. Produce a valid preview and apply it with an injected `after-artifact` crash.
   The original diagnostic record remains failed and the recovery artifact exists.
2. Change only that artifact's `diagnostics` to the failed value shown below,
   retaining its original preview and fingerprint.
3. Resume with the identical expected fingerprint.

Expected: reject a persisted recovery artifact whose diagnostic result conflicts
with a successful recovery, before marking local diagnostic state passed.

Actual output:

```json
{"scenario":"alter-crashed-artifact-diagnostics","status":"reconciled","persisted_diagnostics":{"status":"failed","doctor":{"healthy":false},"errors":["tampered persisted diagnostics"]},"attention":[]}
```

Existing-artifact checking validates schema and preview only. The later hash check
compares bytes against the already-altered object loaded in this same invocation;
the diagnostic-record reader does not validate the artifact's diagnostic outcome.
Fresh Doctor results pass, but the retained immutable evidence says failure while
the local record says success. Validate the entire persisted recovery record and
its diagnostic contract before reuse, with a crash-window corruption regression.

## Feasibility observations and limits

These are code-inspection findings, not live WI-0246 recovery results:

- The original snapshot binds the entire runtime-workers/resources registries.
  Although the early active-worker check filters to the target Work Item, the
  subsequent input loop permits no registry drift. Unrelated WI-0247 worker
  changes therefore reject WI-0246 recovery when they change those bound bytes,
  even after workers complete. This follows the currently approved exact-input
  design; safely permitting unrelated records needs an explicit design change.
- Evidence used by any gate other than `developer_evidence` or
  `developer_handoff` is protected. A Developer reference also used for prebuild
  approval cannot be amended by this route. This preserves product authority but
  narrows applicability; no overlapping-gate amendment was accepted or tested live.
- Event-prefix and ordinary current-actor checks have passing focused fixture
  evidence. No browser, provider, cross-machine, deployment or release evidence
  is claimed. This verification does not replace the parent's full offline suite.

Next owner: Developer to repair F1 and F2 within approved scope and supply a new
exact candidate. A fresh verification judgment is required before advancement.
