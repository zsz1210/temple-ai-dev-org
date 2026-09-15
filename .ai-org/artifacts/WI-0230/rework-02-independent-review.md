# Field remediation rework 02 independent acceptance

Reviewer: `agent-lulu`, Principal `human`; independent runtime `/root/field_release_review`. Developer: `agent-rikku`. Review reservation: `worker-20260915180146-00efeac8`; active claim: `claim-20260915180147-f873e8fe`. The reviewer contributed no production source or repository test implementation. Current responsibility is Quality & Evaluation Engineer, with distinct-Identity independent review of the complete authorized candidate.

Exact WI-0230 candidate: `8bfe38892283744ba0c71bec0cd25f7cf1a02986`, branch `codex/field-remediation`. Scope and acceptance: `docs/planning/field-remediation.md`, ADR-0067, WI-0230 and joined module scopes WI-0231/WI-0232/WI-0233. The whole operating contract, Work Skill, parallel/recovery procedures, specification, previous rejected reviews, developer evidence, current diff, test assertions/results and compatible runtime evidence were read for this judgment.

## Judgment

**Test: PASS. Evaluation: PASS. Independent QA evidence judgment: PASS for all sixteen supported local acceptance scenarios.** IR-01, IR-02 and IR-03 are resolved. No remaining implementation blocker was identified within the frozen scope. The observed measurements and their negative controls support the required behavior; completion is qualified by the environment limits below.

This is the reviewer's substantive candidate-specific acceptance, not an inference from a generated handoff or a worker finishing. Under `TEMPLE.md`, this one report may support the named `test_evidence`, `evaluation_report` and `independent_qa_pass` gates. The integration owner must record eligible lifecycle transitions and release closeout; this report does not itself advance state or authorize publication, deployment, external integration, another experiment or a main-branch merge.

## Exact full verification and independent correction check

The integration owner's full `npm run verify` process on the exact candidate completed with exit 0 on macOS / Node v24.20.0. The reviewer inspected the completed raw log: repository checks, documentation links and package boundary passed; **1250 tests passed, 0 failed, 0 cancelled, 0 skipped, 0 todo**, wall time **285611.118583 ms**. Package boundary: 443 files, 999159 bytes packed, 3880242 bytes unpacked. This is the current complete measurement; no older failed run or isolated replay is substituted for it.

Raw log: `/tmp/temple-field-verify-release-candidate.log`, SHA-256 `a4ab6f69103f606850046f912cec6460e3f8322951da5cffe69a80135ba8030a`. The durable outcomes are recorded here and in the developer verification record; temporary logs remain supporting reproduction material. A final working-tree comparison found no source, test, script, package, public guide or operating-contract changes after the candidate.

The reviewer independently ran `/tmp/temple-independent-doc-example-release.mjs`. It extracts the public guide's actual measurement-plan JSON, creates declared parser inputs in a disposable directory and invokes the repository's pinned `templew.mjs` launcher. Results on the exact candidate:

| Check | Observed result |
| --- | --- |
| IR-03 corrected public JSON, copied unchanged | Exit 0, successful, actual execution started, `acceptance_granted:false`. |
| Repeat the same measurement | Exit 0, successful reuse, `execution_started:false`, `acceptance_granted:false`. |
| Remove only declared PATH | Exit 1, `MEASUREMENT_TOOL_UNAVAILABLE`, unsuccessful, no execution. Environment isolation remains enforced. |

Independent results: `/tmp/temple-independent-doc-example-release-results.json`, SHA-256 `bff1be0fe4ae9e707797853570bdcadb75c5bdca2cba8d2c6e941c5709eaa893`. The fixture was removed after observation. The new repository regression also passed in the full run and exercises the actual Markdown JSON through the public CLI.

## Failed-attempt history and applicability

The earlier records remain valid history: `56700f3a` had seven automated failures; `535c306e` passed its 1232-test full run but was independently rejected for IR-01/IR-02; `aff1b86e` independently corrected those defects but retained IR-03 and ended its full run with 1248/1249 passes and one Console refresh timeout. None of those whole-candidate attempts is relabelled as accepted.

The Console test's isolated unchanged replay passed in 791.325 ms; that was diagnostic evidence only. Review of the current diff confirms that the test deadline changed from 10 to 30 seconds while the real `temple.refresh` event assertion, bounded fetch/read and stream/timer cleanup remain mandatory. No production Console source changed. The exact final full run passed this event assertion in 1754.319583 ms. The additional headroom is acceptable test resource management, not a relaxed product latency requirement or proof of infallible filesystem notifications.

The positive independent IR-01/IR-02 and V12 observations in `rework-01-independent-review.md` and `/tmp/temple-independent-field-rework-results.json` remain applicable: all `src/`, `bin/`, `scripts/`, package metadata and dependencies are byte-identical between `aff1b86e608b15273f9874cc49971cab9e69940a` and the final candidate. Reconciliation now rebuilds fresh views through the public CLI, exposes canonical mutation separately on a view failure, recovers by refreshing views, and rejects identity removal that would orphan an unchanged ordinary active claim. The final full run exercises those corrected paths and their stale-input, current-qualification and interruption controls.

The prior V11 independent public CLI archive export/verify/import/tampering observation remains applicable: archive source and its CLI branch are unchanged from `535c306e`. The same-source browser and installation results also remain applicable. Between `535c306e` and the final candidate, production changes are confined to reconciliation and its CLI routes; dashboard, Console server, status, observer, attention, browser script, installation, model and collaboration paths are unchanged. This is explicit measurement reuse with current applicability judgment, not a claim that those earlier operations were rerun.

The reviewer inspected the browser log and `.ai-org/artifacts/WI-0230/ui-runtime.png`. Chrome 152.0.7977.84 passed four layouts (390x844, 768x1024, 1440x1000, 3440x1440), six primary views, reduced motion and six synthetic attention states. The actual image labels the synthetic fixture and consistently shows completed review, an unavailable independent device observation, execution not running and acceptance not complete. The installation record names candidate `535c306e38355864adc336f0a1289f105855bbdd`, Node v24.20.0, successful fresh initialization/Doctor and legacy upgrade/Doctor, preserved legacy policy bytes and a project-owned file, and zero network calls. It is source-candidate rehearsal, not published-package adoption.

## Frozen scenario acceptance

Each PASS is the independent judgment of the supported layer described here, based on the exact full-run results, reviewed assertions and the compatible independent observations above.

| Case | Judgment and evidence | Remaining limit |
| --- | --- | --- |
| V01 | PASS: `field-actors` and `field-lifecycle` cover qualified default/non-default members, active-claim priority and complete contributor lifecycle; reject another claimant, inactive/expired membership, Principal mismatch and missing current disciplines. | Synthetic contributors on one Mac. |
| V02 | PASS: `field-lifecycle` assurance uses the actual non-default Developer handoff and sponsor; rejects that Developer as reviewer and the actual Developer's Principal as independent human approver. | Approval/provenance fixture metadata does not authenticate a real human. |
| V03 | PASS: `field-actors` profile preview/apply preserves IDs, existing claim/history/evidence, product edits and binding; mismatched proposal or stale input cannot write or relabel ownership. | Same-machine policy fixtures. |
| V04 | PASS: ordinary explicit attribution works without binding; valid existing binding remains usable; unknown contributor and invalid, expired, mismatched or strict missing provenance fail with actionable guidance. | No external provider sign-in performed. |
| V05 | PASS: `field-lifecycle`, workflow and assurance controls distinguish ordinary visual work from deployment/security risk; team profile does not remove per-task assurance floors. | Local task classification; no deployment performed. |
| V06 | PASS: `field-verification`, CLI and fresh independent example reuse immutable successful measurements without execution or acceptance; tampered, missing, retired, incomplete or failed evidence causes a conservative miss. | Review remains responsible for declared-input completeness. |
| V07 | PASS: changes to input bytes/modes/directory inventory, dependencies, tests, fixtures, command, toolchain and declared environment invalidate compatibility; unknown inputs block execution. | Undeclared external variability cannot be assumed identical. |
| V08 | PASS: `field-attention`, private-view CLI and compatible real browser evidence separate completed review, missing environment, attached execution and acceptance; stale/expired evidence cannot invent readiness. | Real-device unavailability is a labelled synthetic condition. |
| V09 | PASS: real macOS Node, non-Node argv and confined-node measurements passed; missing tools, shell interpretation, timeout/output limits, descendants and unsupported capability controls remain enforced. IR-03 now passes through the public launcher with a missing-PATH negative control. | Windows execution is explicitly unsupported; other hosts were not independently executed. Trusted-local is not a sandbox. |
| V10 | PASS: reconciliation preserves independent histories, rejects ownership/lifecycle/identity ambiguity, fingerprints unchanged active claims and inventory, refuses stale input and rebuilds derived views. Independent IR-01/IR-02 corrections and final full CLI/integration controls agree. | Local branch fixtures do not establish a distributed lock or independently operated machines. |
| V11 | PASS: real local clone and historical-byte/archive fixtures plus compatible independent CLI observations verify exact binary/empty/spaced bytes, immutable attempts and missing-history behavior; tampering, symlinks, escape, collision and false source assertions are rejected. | Same-machine clone; integrity is not external source authentication. |
| V12 | PASS: real SIGKILL/intervening-edit tests, public CLI post-apply failure/recovery, independent view-only recovery and existing same-scope/Lean cases preserve actual mutation status, owner and next action without fabricated closure. | Bounded local process/filesystem interruption coverage. |
| V13 | PASS: synthetic new contributor performs an actual product edit and parser measurement without extra Temple login or human intervention; ineligible member/claim guards remain. The public executable example is independently usable. | Final run's 393/394/460 ms claim/edit/output times are automation observations, not human onboarding or model performance. |
| V14 | PASS: repeated display labels retain distinct stable IDs, idempotent setup and persisted reloads; ambiguity, rename or Position changes do not merge responsibility/history. | Reopened sessions are represented by persisted fixture reloads. |
| V15 | PASS: local product measurements and immutable attention projection apply the same acceptance boundary to human, ordinary AI and governed Agent categories; an edit, commit, merge flag or metadata alone grants no acceptance. | Authorship categories are fixture records; hosting permissions were not exercised. |
| V16 | PASS: actor/lifecycle/assurance controls distinguish attributed, legacy and strict policies; enforce current qualification and the actual sponsor; self-description cannot become authenticated provenance or independent human approval. | External provenance remains simulated and labelled. |

F01-F13 are covered by these V01-V16 judgments and the implementation map in `verification-report.md`; no frozen finding is omitted or deferred as an implementable local defect.

## Joined module candidate compatibility

The canonical Work Item handoffs were inspected, and `git diff --name-only <module-candidate> 8bfe3889 -- <owned-paths>` returned no changes for each scope below. This report explicitly accepts these unchanged module candidates for their named scope using the current complete integration measurement and compatible reviewed evidence. It does not retrospectively accept the earlier rejected WI-0230 parent candidate.

| Module | Canonical candidate and unchanged owned paths | Independent decision |
| --- | --- | --- |
| WI-0231 | `535c306e38355864adc336f0a1289f105855bbdd`; `src/actor-resolution.mjs`, `src/collaboration.mjs`, `src/local-identity.mjs`, `src/model.mjs`, `test/field-actors.test.mjs`. | Test/Eval/Independent QA evidence PASS for actor/collaboration scope; compatible with final integration. |
| WI-0232 | `535c306e38355864adc336f0a1289f105855bbdd`; `src/verification.mjs`, `src/delivery-check.mjs`, `src/delivery-ledger.mjs`, `src/delivery-check-worker.mjs`, `test/field-verification.test.mjs`. | Test/Eval/Independent QA evidence PASS for measurement/adapter scope; compatible with final integration. |
| WI-0233 | `aff1b86e608b15273f9874cc49971cab9e69940a`; `src/evidence-bundle.mjs`, `src/reconciliation.mjs`, `src/delivery-attention.mjs`, `test/field-evidence.test.mjs`, `test/field-reconciliation.test.mjs`, `test/field-attention.test.mjs`. | Test/Eval/Independent QA evidence PASS for evidence/reconciliation/attention scope, including the repaired invariants; compatible with final integration. |

The integration owner may cite this substantive shared report for those named gates and retain the existing exact module handoffs; another invented Developer handoff or complete replay of each unchanged old candidate is unnecessary. Required lifecycle ownership, fresh Doctor diagnostics and bounded release closeout remain the integration owner's responsibility.

## Explicit limits and stop

Windows execution is unsupported, and this work did not validate independent humans operating separate machines. Same-machine clones, synthetic contributors, strict-provenance fixtures and the simulated unavailable device establish only their named layers. Missing historical bytes remain missing. No paid model call, account-quota polling, token measurement or monetary estimate was performed; model tokens and cost are unknown. Timing measures local automation and test wall time, not general productivity.

The authorized local implementation and acceptance slice is complete. Next owner: the integration owner for canonical gate recording, Doctor and bounded organizational closeout. This acceptance does not grant external publication, deployment, downstream adoption or further experimental scope.
