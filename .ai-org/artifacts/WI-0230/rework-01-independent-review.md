# Field remediation rework 01 independent review

Reviewer: `agent-lulu`, Principal `human`; actual runtime `/root/field_final_review`. Developer: `agent-rikku`. Review reservation: `worker-20260915175330-3e16bfe8`; claim `claim-20260915175330-b5103739`. This reviewer made no implementation or repository test-source contribution. Initial responsibility is Quality & Evaluation Engineer; this record may support multiple named gates only after the corresponding substantive judgment exists.

Reviewed behavioral candidate: `aff1b86e608b15273f9874cc49971cab9e69940a`, branch `codex/field-remediation`. Approved scope is WI-0230 and its joined WI-0231/WI-0232/WI-0233 modules, `docs/planning/field-remediation.md` and ADR-0067. WI-0231 and WI-0232 retain their canonical candidate `535c306e38355864adc336f0a1289f105855bbdd`; their implementation and test paths are unchanged in `aff1b86e`.

## Current judgment

**WI-0230 Test: rejected. Evaluation: rejected. Independent acceptance: pending, not granted.** The sole remaining reproduced blocker is IR-03 below: a copied public measurement example remains unusable until PATH is declared. IR-01 and IR-02 are independently corrected; no remaining source defect was found in their recheck or in the other scoped modules. Neither focused passes nor a runtime finishing imply lifecycle acceptance.

The source review and bounded independent observations support the WI-0233 corrections at `aff1b86e`; WI-0231 and WI-0232 source scopes remain compatible with their canonical `535c306e` measurement. Final module gate acceptance still requires applicable complete verification and the integration owner's eligible lifecycle recording. The outstanding documentation defect does not invalidate the positively observed IR-01/IR-02 corrections.

The full `aff1b86e` run subsequently ended with 1249 tests, 1248 passes and one failure in `test/optional-console-collector.test.mjs:133`, `the optional Console emits a bounded refresh signal after canonical state changes`: `Console refresh signal timed out`. The log reports wall time 285050.427375 ms. This is an additional unresolved verification result, not yet a diagnosed source defect. The integration owner was notified before freezing another candidate; the failed run must remain recorded and cannot count as full verification success.

## Independently observed corrections

`node /tmp/temple-independent-field-rework.mjs` completed with exit 0 on Node v24.20.0/macOS. The script adapts the original rejected public CLI reproduction and creates only disposable initialized project fixtures.

| Observation | Actual result |
| --- | --- |
| IR-02: remove a non-default active claimant and its membership/sponsorship on an incoming branch, without a worker or registered task; select only identity records for preview | Exit 1, `valid:false`, `mutation_performed:false`; explicit `active-claim-agent-unavailable` and `TEMPLE_ACTOR_INELIGIBLE` conflicts on the unchanged Work Item. Its bytes and the directory inventory participate in `validation_inputs`. Both selected files remain byte-identical. |
| IR-01: reconcile an independently added resource through the public preview/apply CLI, with an existing generated parallel plan | Exit 0, `mutation_status:applied`, `views_rebuilt:true`, `acceptance_granted:false`; the resource exists and read-only Status succeeds. The rebuilt parallel plan is valid and fresh and retains the independently chosen worker ceiling of 3. |
| V12: make generated status a directory, call view refresh, repair that filesystem condition and repeat view refresh | First exit 1 with `RECONCILIATION_VIEWS_FAILED`, canonical mutation false, status unchanged and the precise refresh recovery action. Second exit 0 with views rebuilt; canonical resource bytes remain identical. |

The independent observations are retained in `/tmp/temple-independent-field-rework-results.json` and `/tmp/temple-independent-field-rework.log`. Those temporary files aid reproduction; this table is the durable outcome record. Developer regression separately exercises an actual generated-view failure after canonical apply, preserving `mutation_status:applied` and recovering without replay. Inspection of its assertions confirms that the test checks filesystem behavior rather than a mocked writer exception.

## IR-03: copied public measurement example cannot resolve Node

Priority: P2. Surface: `docs/operations/collaborative-delivery.md`, measurement JSON example. The command is `node`, but `environment.names` is empty. The implementation deliberately removes undeclared environment values; therefore a bare executable has no PATH to search.

Independent reproduction extracted the JSON directly from the document, created every declared source/test/dependency file, and called `runMeasurement` on the local Node 24/macOS host. The original example returned `status:blocked`, `successful:false`, `execution_started:false`, `reason:MEASUREMENT_TOOL_UNAVAILABLE` and `Executable is unavailable in the declared environment`. Changing only `environment.names` to `["PATH"]` ran the actual parser test successfully, retaining `acceptance_granted:false`.

Reproduction: `/tmp/temple-independent-doc-example.mjs`; observed results: `/tmp/temple-independent-doc-example-results.json`. Required correction: declare PATH in the example and explain that a bare executable requires this declared lookup input, or use an actual absolute executable path. Do not weaken environment isolation. This affects F11/V09 usability and needs a bounded example recheck and the repository's applicable verification before acceptance.

## Evidence applicability review

The reviewer read the full operating contract, Work Skill and parallel/recovery references, frozen V01-V16 scenarios, ADR-0067, handoffs, prior rejected review, verification reports, the field test assertions and the corrected source diff. Actor selection/provenance and measurement fingerprints/reuse were inspected directly. The corrected reconciliation inventory validates unchanged active responsibility against shared actor eligibility while retaining historical released claims and rejecting stale consulted inputs.

The `535c306e` browser log records Chrome 152.0.7977.84, four layouts (390x844, 768x1024, 1440x1000, 3440x1440), six primary views, reduced motion and six synthetic attention states. The reviewer visually inspected `.ai-org/artifacts/WI-0230/ui-runtime.png`: the environment-waiting detail distinguishes completed review, not-running execution, incomplete acceptance and an unavailable independent device observation. Synthetic data are labelled. The source diff is empty for dashboard/server/status/observer/attention and the browser script; this is compatible prior runtime evidence, not a claimed repeat execution.

The `535c306e` installation result names that exact candidate and Node v24.20.0. Fresh initialization/Doctor and legacy upgrade/Doctor all exited 0; fresh attribution, preserved missing legacy actor-policy bytes and a preserved project-owned file were observed, with zero network calls. Installation/model/collaboration paths are unchanged by `aff1b86e`; the CLI changes route reconciliation only. This is compatible source-candidate installation evidence, not published-package adoption.

The previous distinct review's V11 public CLI binary export/verify/import and tampering measurements remain applicable: archive code and its CLI branch are unchanged. The archive test assertions additionally verify a real local single-branch clone without the source commit, exact binary/empty/spaced bytes, immutable import, missing historical bytes, symlinks, path escape and forged-source distinction. No archive is treated as provider authentication or acceptance.

## Frozen scenario assessment

The following assessment identifies supported evidence layers and negative controls. No additional source defect was identified in this review. Final passing gate decisions await IR-03 resolution and a complete successful verification run, including diagnosis of the observed Console timeout.

| Case | Evidence and assessed behavior | Environment limit |
| --- | --- | --- |
| V01 | `field-actors` and `field-lifecycle`: default/non-default selection, active claim precedence, complete synthetic member lifecycle; reject foreign claims, Principal mismatch and inactive/expired or unqualified membership. | Synthetic contributors on one macOS host. |
| V02 | `field-lifecycle` assurance case: actual non-default Developer handoff/sponsor determines separation; same Developer reviewer and actual Developer's Principal approval are rejected. | Fixture approval metadata does not authenticate humans. |
| V03 | `field-actors` profile preview/application preserves Work Item/history/evidence/claim bytes, existing edit and binding; mismatched proposal and stale input cannot write. | Same-machine policy fixtures. |
| V04 | `field-actors` and lifecycle: explicit ordinary attribution works without binding; valid binding remains usable; unknown Principal, invalid/expired/mismatched provider binding and strict missing provenance are actionable failures. | No external provider login was performed. |
| V05 | `field-lifecycle` visual-task/deployment comparison plus workflow assurance tests retain per-task floors independently of team profile. | Local task classification, no deployment. |
| V06 | `field-verification` and CLI: administrative-only changes reuse immutable successful measurement with intact artifacts, completed result and no new execution/acceptance; lost/tampered/retired/failed evidence misses. | Declared-input compatibility still requires reviewer judgment. |
| V07 | `field-verification`: changed bytes, directory additions/deletions/modes, dependencies/tests/fixtures, command, toolchain and environment invalidate the key; unknown input stops execution. | Undeclared real-world variability cannot be inferred as identical. |
| V08 | `field-attention`, private CLI snapshot and compatible real browser evidence separate completed review, missing environment, attached running execution and acceptance; old/expired/non-measurement evidence cannot create readiness. | The device condition is synthetic; no real device was validated. |
| V09 | `field-verification` and CLI run real Node/non-Node argv commands, reject shell interpretation, supervise timeout/output/descendants and retain confined-node restrictions; IR-03 identifies a broken public example. | macOS execution observed; Windows explicitly unsupported, other hosts not independently run. |
| V10 | `field-reconciliation`, CLI regressions and independent IR-01/IR-02 rechecks preserve independent histories, reject ownership/lifecycle/identity conflicts and stale previews, validate unchanged active claims, and rebuild derived views deterministically. | Local branch fixtures; no distributed-lock or independently operated machine claim. |
| V11 | `field-evidence` and compatible earlier independent public CLI observation retrieve exact historical bytes with digest checks, preserve invalidated attempts and reject tampering/escape/collision or missing source bytes. | Same-machine clone; archive integrity does not establish source authentication. |
| V12 | `field-reconciliation` real SIGKILL/intervening-edit cases, public CLI post-apply recovery, independent view-only failure/recovery and existing same-scope/Lean recovery tests retain state, owner and next action without fabricated acceptance. | Bounded local process/filesystem interruptions. |
| V13 | `field-lifecycle` performs a real local product edit and parser test under a synthetic new member with zero extra login and zero human intervention; qualification and conflicting-claim guards remain exercised. | Automation timing is not human onboarding or model speed. |
| V14 | `field-actors` repeated-label initialization, stable ID disambiguation and idempotent setup preserve distinct identities; ambiguous actors and role changes do not merge records or silently select defaults. | Session reopening is represented by persisted fixture reloads. |
| V15 | Lifecycle product measurement and immutable attention projection associate human/ordinary/governed labels with the same acceptance boundary; an edit, measurement, merge flag or local metadata alone grants no acceptance. | Authorship categories are fixture records, not external hosting validation. |
| V16 | Actor/lifecycle/assurance cases distinguish attributed, legacy and strict policy; shared current qualification and actual sponsor apply, and self-assertion never becomes authenticated provider identity or independent human approval. | External provenance is simulated and honestly labelled. |

No account quota polling, paid model experiment or token/cost measurement was performed. No Windows runtime, independent human-machine trial, external publication, deployment or merge is covered. Repository lifecycle administration remains with the integration owner.
