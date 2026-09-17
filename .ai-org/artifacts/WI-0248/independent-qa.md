# WI-0248 Independent QA

**PASS** for the approved diagnostic-recovery repair at exact candidate
`0c1c6f1cc999bcf50a8d8ae0e1e89fe05b991ed7`. No blocking defect was found.
This verdict permits the next required Release Gate judgment; it does not grant
release, merge, publication, deployment or ordinary-finish acceptance.

## Identity, candidate and environment

- Position: `independent_qa`; Agent Identity: Lulu (`agent-lulu`); Principal:
  `human`. `.ai-org/project/assignments.json` independently confirms Developer
  is Rikku (`agent-rikku`), a different Agent Identity. WI-0248 claim history
  confirms the same separation. Provenance is self-asserted, not provider
  authentication.
- Active QA claim: `claim-20260917154651-168f21f2`; worker:
  `worker-20260917154651-bbe4f0e9`; attached runtime:
  `/root/physical_recovery_qa`. The claim and worker pin the exact candidate.
- Effective workflow/risk: Standard/standard. This is formal Independent QA
  under Standard, not High-Assurance qualification. The Test evaluator also
  uses `agent-lulu`; Developer/QA separation remains intact.
- Branch: `codex/readme-alpha33-onboarding`; reviewed parent:
  `e8bb015b5c5ad9c6af55af8af3942c9d676bedaf`.
- Independently inspected local runtime: Node.js `v24.20.0`, Darwin ARM64,
  Git `2.50.1 (Apple Git-155)`.
- HEAD matched the candidate. In addition to Git diff inspection, QA computed
  raw Git blob hashes directly from working bytes and compared them with the
  candidate tree, avoiding reliance on Git status or index flags:

| File | Matching raw blob |
| --- | --- |
| `src/lean-finish-recovery.mjs` | `ca0ac390d2aba707abd878cedb3cd646dece14f1` |
| `test/lean-finish-recovery.test.mjs` | `b385b39664ebe34c4c8b9f5af91dc04200180bc5` |
| `docs/operations/lean-finish-recovery.md` | `1266ee2d15f788576fd31b4e29c97aed545d31d8` |

Concurrent administrative/evidence edits were present and preserved. QA changed
only this report; temporary fixture operations did not repair the implementation.

## Evidence and independent judgment

Read the full operating contract, Work Skill and assurance procedure, resolved
WI-0248 context, inspected approved `design.md`, `developer-evidence.md`,
`test-evaluation.md`, `full-verification.md`, and reviewed the exact three-file
commit delta plus the surrounding recovery implementation and fixture setup.

The Integration Owner's exact-candidate `npm run verify` record supplies exit 0,
**1,269 passed, 0 failed/cancelled/skipped/todo**, 342,059.383625 ms. The distinct
Test runtime's record supplies its own **16/16** recovery rerun and **3/3** added
probes, including changes after the immutable-artifact checkpoint under both
flags and an ignored inventory addition between preview and apply. QA inspected
and reused these measurements; it did not rerun or claim to have personally
executed those broad checks. The Test report's pending-full-suite condition is
resolved by `full-verification.md`.

Source review confirms physical inspection is part of every preview: direct
preview, apply entry, after diagnostics and before settlement. Expected entries
come from the literal candidate Git tree with NUL-delimited names; actual regular
file bytes are hashed without clean filters. Working executable modes and scoped
inventory are compared. Missing files, extra files, unsupported Git entries,
symlinks and linked ancestors reject. Index flags are not cleared or relied upon.
The tests demonstrate unchanged flagged files still reconcile with flags intact.

The change does not remove existing actor, Solo/Lean/risk, unclaimed-Test,
approval-fingerprint, original receipt/journal, evidence, resource, policy or
crash-resume guards. Reconciliation continues to record
`acceptance_granted: false`; it does not replay lifecycle writes or substitute
diagnostics for the distinct Verifier. The operator guide matches these limits.

## Additional independent QA counterexample

QA executed one targeted `node --input-type=module` test against the exact
candidate, using `cachedFixture`, `finishLeanWorkItem`,
`previewLeanFinishRecovery`, `recoverLeanFinish` and the project mutation lock.
This addresses nonregular-file handling not exercised by the existing 19 checks.

Reproduction sequence:

1. Allocate an isolated cached fixture, confirm its fixture integration policy,
   and inject a finish failure at `before-doctor` to retain failed diagnostics.
2. Write a fixture-only recovery approval and obtain a valid preview fingerprint.
   Snapshot all canonical organization bytes and the complete diagnostics record.
3. Set `git update-index --skip-worktree app.mjs`, unlink that temporary fixture
   file, and run `mkfifo` at its exact path. Confirm scoped Git status is empty.
4. Request preview and locked apply with the original fingerprint. Both reject
   with `Product scope changed: unexpected filesystem entry`; neither blocks
   reading the FIFO.
5. Assert canonical bytes and the entire failed diagnostics record are unchanged,
   and the recovery artifact is absent. Registered fixture cleanup completes.

Observed output, attributed to `agent-lulu` / `independent_qa`:

```text
probe: skip-worktree-hidden-fifo
preview: rejected
apply: rejected
canonical_bytes: unchanged
diagnostics: unchanged-failed
artifact: absent
tests 1; pass 1; fail 0; cancelled 0; skipped 0; todo 0
test duration: 2084.923625 ms
run duration: 2199.563083 ms
exit: 0
```

`git diff --check` also passed during review. Broad/full/fast suites were not
repeated for this bounded QA slice; the Integration Owner retains responsibility
for final report checks and current organization diagnostics after worker join.

## Limits and retained observations

Ordinary `work-item finish` is unchanged and outside this repair. This verdict
does not qualify that path against Git-hidden product changes. No live recovery
was repeated on the already accepted README item, and no external/model
experiment was performed.

Historical D1 remains a low, nonblocking diagnostic-quality limitation. The
WI-0247 `independent-verification-v2.md` report records a malformed unrelated
worker missing `resource_reservation_ids` producing a raw status-renderer
`TypeError` before Doctor. Its recorded result is fail-closed with unchanged
lifecycle/diagnostics and no recovery artifact. QA inspected that historical
evidence but did not rerun or claim to repair D1 in this cycle.

Coverage is local offline Node.js 24 on macOS ARM64 with ordinary SHA-1 fixture
repositories. SHA-256 repositories, submodules, huge trees and adversarial
concurrent filesystem races are not runtime-qualified here. The new FIFO probe
qualifies this particular nonregular entry rejection, not all special files.
Raw checkout transformations intentionally fail closed. These are bounded local
consistency checks, not authentication against an actor able to rewrite all
repository and local recovery state.

Context reported a stale generated parallel plan after worker preparation; this
is an administrative join/diagnostic obligation for the Integration Owner, not
passing fresh Doctor evidence. Next owner: Release Manager after Integration
Owner joins this report and refreshes the required organization diagnostics.
