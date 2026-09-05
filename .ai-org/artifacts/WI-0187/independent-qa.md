# WI-0187 Independent QA

**PASS** for the bounded slice B contract on candidate `2611def7db156eab8e1936f5feeefe7c51ade014`.

## Identity, environment and boundary

The active assignments identify Developer as `agent-rikku` and Quality Evaluator / Independent QA as `agent-lulu`. The Work Item's Developer handoff independently names `agent-rikku` and the exact candidate above. This review runs as `agent-lulu`, under claim `claim-20260905135348-3e0916c1`, worker `worker-20260905135348-1690fe96`. These are distinct Agent Identities; sharing Human Principal `human` does not collapse them.

Reviewed the compact quality-evaluator Context route, repository instructions, operating contract, Work Item, assignments, approved brief, ADR-0057, Developer evidence, completion guide and changed implementation/tests. Environment: Darwin arm64, Node.js `v24.20.0`, checkout `temple-wi-0187-lean-finish`, branch `codex/wi-0187-lean-finish`. Initial and final `git rev-parse HEAD` matched the candidate. Final `git diff HEAD -- src test scripts docs` was empty. Runtime coordination and generated records changed independently of the frozen code; this reviewer wrote only this report and disposable synthetic fixtures/probes.

## Independently executed checks

`node --test test/lean-finish.test.mjs test/lean-delivery.test.mjs`: **46/46 passed**, zero failures, cancellations or skips, **85,223.967833 ms**. This includes 30 completion tests and the original 16 delivery tests. Log SHA-256: `b25243897336b76fe3bce84239c7233a6fa65495a07f88120d879b53d4189a61`.

The actual CLI tests establish normal Developer and distinct Verifier completion, read-only preview and historical replay, equivalent canonical Work Item/events against the named individual operations, preservation of old `deliver`, exact candidate and claim requirements, same-Identity rejection, ineligible profile/risk/UI/runtime worker rejection, and evidence/authority drift rejection. Every named journal write and diagnostic persistence boundary is exercised; repeated recovery does not duplicate handoff, transition or acceptance events. Terminal diagnostic failure remains observable through freshly built Status and Doctor. Doctor warnings cannot become successful completion. Qualification and normalized evidence expiry are revalidated even when their source bytes have not changed. Settling one operation does not hide another operation's failed diagnostics.

Eight additional independent counterexample probes passed:

1. Changed usage-policy bytes in the `after-status` checkpoint. The post-diagnostic binding check rejected the operation and kept diagnostics pending. An identical retry rejected while authority remained changed, without new canonical writes. Restoring the original bytes allowed diagnostics-only repair.
2. Changed the diagnostic journal target: rejected without canonical writes.
3. Changed the diagnostic operation key: rejected without canonical writes.
4. Removed the passed Doctor record's `validation_scope`: rejected without canonical writes.
5. Added a Doctor warning count to the passed record: rejected without canonical writes.
6. Added a nonempty failure check to the compact passed Doctor record: rejected without canonical writes.
7. Changed the diagnostic journal's canonical receipt output hash: rejected without canonical writes.
8. Appended a newline to the canonical receipt itself after successful completion: historical success was rejected without further canonical writes.

The disposable probes used `test/helpers/lean-delivery-fixture.mjs`, the actual CLI and `finishLeanWorkItem` under `withProjectMutationLock`. They created no model sessions or external actions. Each diagnostic-record alteration started from the same valid successful record; before/after canonical bytes were compared for rejection. Probe output SHA-256: `77b40017a4d0af0af19a8e8feaeb180f8b6306ebf3d63334754afbc2a3794a30`. Probe script SHA-256: `fe67e773a5bf1db23b6e6c07a7f691779d0d3f6031d5857fea942696d0020b92`.

To reproduce the extra probes, prepare a normal Developer fixture as in the first completion test, set `request.position = "developer"`, and confirm the synthetic repository-integration record. For probe 1, call the locked completion with an `after-status` hook appending a newline to `.ai-org/project/usage-policy.json`; assert rejection, pending diagnostics and no-write rejection on retry before restoration. For probes 2–7, complete through the CLI, locate `finish-WI-ID-OPERATION.json` with `leanDeliveryStateDirectory`, clone its valid JSON for each mutation above and assert nonzero CLI exit plus unchanged canonical bytes. For probe 8, restore the diagnostic record and append a newline to `record.journal.result.receipt`; assert the same no-write rejection. The synthetic fixtures are removed after each scenario.

## Coordinator evidence, separately attributed

The coordinator reports full exact-candidate `npm run verify`: **619/619 passed**, zero failures/skips, **152,265.363292 ms**, log SHA-256 `4ac19541d5ad614f2757059f6a9cf4f7ee93f56faedd64aa8dd814be30012e0a`. I did not duplicate the complete suite. Coordinator Doctor: 37 pass, zero warnings/failures. The reported npm inventory is 406 files, 3,442,877 unpacked bytes, versus 403 files previously; only the completion module, ADR-0057 and completion guide are added. Source review confirms the package ceiling change names these three additions, with no dependency or exclusion change. Coordinator publication audit: zero blocked findings, 68 prior binary review findings.

## Interpretation and limitations

No blocking counterexample remains within the reviewed contract. Diagnostic records are checkout-local recovery observations; a historical pass is explicitly labeled historical and is not fresh verification. Lean acceptance records caller-supplied judgment and existing evidence; it does not generate a correctness judgment or claim formal Independent QA for the delivered Lean item. Standard gates and distinct QA qualify this framework implementation separately.

The measurement harness compares named administrative paths: completion plus explicit Status inspection plus Doctor uses three commands; `finish` uses one. Claims, product tests, evidence authoring and setup are excluded. Its Verifier baseline uses the existing direct transition path, while the semantic-equivalence test uses explicit release plus transition to compare the intended release facts. The observed three-to-one count therefore describes the specified harness; it is not a universal count for every individual-operation sequence. Local elapsed time and response bytes are not uniformly lower. No model benchmark, Token savings, end-to-end speedup or quality improvement is established by this review.

Acceptance is bounded to local slice B. It does not authorize merge, publication, deployment or a live comparison. Slice C may start under the user's separate existing authorization after the coordinator completes B's organizational closeout.
