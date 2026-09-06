# WI-0186 corrected Independent QA: PASS

Candidate: `3cf56d80b27f5499f65b2357d8c3602c30cdbfbf`. Environment: Darwin arm64, Node.js v24.20.0. The implementation, tests, scripts and documentation matched this exact commit before and after independent verification (`git diff --exit-code <candidate> -- src test scripts docs`). Review focused on the correction from `ea8ef29799a4bbcde94c4ff296a37fdb48b031c0`; the original failing report is preserved in `independent-qa.md`.

Assignments independently confirm Developer is `agent-rikku`, while both Quality Evaluator and Independent QA are `agent-lulu`. These are distinct Agent Identities. This review used prepared worker `worker-20260905132428-298e2e9b`, active claim `claim-20260905132428-3c855911`, and runtime `/root/scoped_material_corrected_qa`. QA changed only this report, with no implementation or canonical lifecycle mutation. The work is Standard, not High-Assurance.

## Independent results

- `node --test test/context-packet.test.mjs`: **18 passed, 0 failed or skipped**, 24.616 seconds. This independently reruns the two actual CLI regressions and all prior packet tests on the corrected candidate. Local log SHA-256: `9821e294b62604d1d5e5ef1c1e8e1d903629ca235a16311766f30de287626c37` (`/tmp/wi0186-qa-v2-packet.log`).
- The valid pinned Context route independently requiring both `temple.lock` and `.ai-org/core/positions.json` now returns complete, byte-identical full bodies, retaining `context-route` as a selection reason and `independently-required-whole-source` as the representation reason.
- Approved content-hashed repository specification references to both sources likewise return complete full bodies and retain `specification`. These regressions assert that canonical fixture bytes do not change.
- Additional independently constructed actual CLI probes passed for `--purpose integration`: a pinned documentation Context route requiring the full lock and an approved `technical_design` specification pinned through `contract_refs` requiring the full Position document. Both were selected, acquired completely, and emitted whole with the independent reasons. This challenges a different purpose and a different specification-reference field from the added regressions.
- In that combined probe, a stage digest acquired before adding the explicit references was rejected with `STALE_PREVIEW` afterward. Recomputed representation and packet digests matched; original-source and emitted-body hashes were equal for both whole sources; canonical fixture bytes remained unchanged.

The additional probe used the repository's `fixture()`, then added a valid active documentation route with `paths: ["temple.lock"]`, Developer Position and the fixture Work Item pinned in the route. Its ID was pinned in `item.context_refs`. An approved native `SPEC-0001` of kind `technical_design`, revision `rev-1`, used `.ai-org/core/positions.json` as its repository source with the actual source SHA-256, `tech_lead` ownership, human approval and `docs/brief.md` approval evidence; `item.contract_refs` pinned that ID/revision. Acquisition used the real CLI with Developer, stage material, integration purpose, no-write and JSON flags. Probe script SHA-256: `0f3a92f7f6a63ddfc192aa259f4940abc2c7ee1b4428b699766fb104a3948447` (`/tmp/wi0186-qa-v2-probes.mjs`); it exited zero and cleaned its fixture.

## Counterexample review

The narrow correction restores reasons from canonical selected route/spec references before projection eligibility is decided. It does not modify the conservative projection rules, whole-source acquisition, freshness checks, limits or CLI mode selection. Set-based reason aggregation preserves de-duplication.

I examined the analogous source categories in `context.mjs` and `compactContextEntry`. Work Item, gate and latest-handoff reasons are explicitly reconstructed by acquisition. Valid Learning entries have fixed `.ai-org/learning/{lessons,practices}/<ID>.md` paths, so they cannot validly coincide with either projected authority inventory. Capabilities remain supporting discovery references under the existing acquisition contract. No additional valid authority-path reason-loss counterexample was found in this bounded review.

The independently rerun suite retains passing checks for unknown/custom shapes, exact ownership rather than allowed-root ownership, complete retained Position restrictions, explicit gate/recovery/ambiguous-scope fallbacks, stale omitted source content, mode binding, acquisition failures and byte-identical governing whole bodies. Previous broad package and adversarial findings in `independent-qa.md` apply to the unchanged projection implementation; this cycle did not duplicate the package inventory comparison or full suite.

## Coordinator evidence and limits

The coordinator separately reports full `npm run verify` on this exact candidate: **589 passed, 0 failed or skipped**, 108.733 seconds. Log SHA-256: `f4d1ee131a83c3e252c94b88c78a6deb0440bf6eaf8e31ad6ad32903ef77e8b9` (`/tmp/wi0186-full-v2.log`). The coordinator also reports Doctor 37 passed with no warnings/failures, publication audit zero blocked items with the same 68 pre-existing binary review items, and byte-exact reproduction of committed `measurement.json`. These are coordinator evidence, not independent full executions by this QA runtime.

The selected synthetic byte observations compare stage material with the previous full packet. They do not establish Token savings, model latency, correctness superiority or end-to-end efficiency. Full source acquisition and required reading obligations remain unchanged. No live model experiment, merge, publication or external release was performed or authorized by this review.

Disposition: **PASS for the corrected bounded WI-0186 candidate**, with the original explicit-full-source blocker resolved and no remaining blocker found. This report supplies Independent QA evidence; the coordinator still owns lifecycle integration and closeout.
