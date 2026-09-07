# Bounded delivery refinement — WI-0235

## Outcome

The follow-on candidate addresses the five recommendations from [WI-0234](../WI-0234/comparison-v2-report.md) without starting another model batch. It changes instructions and the future experiment contract; it does not demonstrate improved model efficiency yet.

Candidate: `68be154276fe2648a35eadf6c3e59c665ced2ea9`.

| Recommendation | Implemented response | Evidence boundary |
| --- | --- | --- |
| Proportional small-task execution | One reading route and one existing completion command. Compact resolution plus required reads can go directly to `finish`; a material packet is optional. No duplicate completion or same-state diagnostics. | Installed local scenario passes; no model forward test. |
| Clear handoff semantics | Existing canonical unresolved/next-action fields are clarified. Future experiment output separately names `blockers`, `next_owner`, and `not_performed`. | Benign downstream declarations pass; actual blockers, failed oracle/tests, absent candidate and invalid owner fail. No automatic prose reinterpretation. |
| Measure overhead | Transient command inspection produces eight fixed categories and observed output bytes by category, plus authored request/schema bytes. Unknowns and incomplete coverage remain explicit. | Counts/bytes are not per-command Tokens, a permission check, or proof that a model read a file. |
| Capture deterministic records once | Reuse existing `finish` for exact revision, evidence references, one handoff, claim release and diagnostics; instructions prohibit a duplicate manual narrative or second completion operation. | Actual product tests/evidence must still be supplied. Approval, risk judgment and independent acceptance are not inferred. No new generic test executor was added. |
| Offline qualification before more spending | Local tests exercise real installation/upgrade/completion and mocked provider boundaries. New completion/protocol versions reject old approvals. | No live generation, fallback, retry, reset or Credit operation performed by this improvement run. Coordinator work still consumes its own resources. |

## Structural observation

The isolated installed recipe completed with one compact navigation call and one `finish` call, without a packet request or additional Status/Doctor calls. Its compact response was **3722 bytes**. The fixture already had an approved task, claim and real product-test evidence; setup, required source reads and product implementation/testing are not counted as zero or included in those two calls.

The actual outcome was one Developer handoff, released claim, exact candidate preserved, Test owned by Quality Evaluator, empty actual unresolved list and full successful diagnostics. This is an executed CLI scenario, not evidence that an autonomous model will choose the shortest route.

A one-command synthetic telemetry summary serialized to **483 bytes**. The collector retains only bounded item IDs transiently for deduplication, fixed counters and coverage flags; no raw command, path, output, prompt or reasoning is added to that summary. Commands containing complex shell syntax remain `unknown`. Each output field is capped at 2 MiB for counting and marked as a lower bound when capped; absent output is unavailable, not an observed zero. The existing runner's event/usage accounting is separate.

Authored user/developer text and output-schema sizes exclude native instructions, source reads, provider formatting and cache behavior. Total model context remains `null`/unknown. These observations help locate work to inspect; they cannot assign the measured Token difference causally to a command category.

## Verification

- Focused offline tests: **30/30 passed** across the future delivery contract, repaired runner and unchanged legacy adapter.
- Installation/upgrade scenario: managed recipe updated, project-owned integration policy preserved, direct stage completion and full diagnostics passed.
- Repository, documentation-link and package checks: passed; 415 package files, no new dependency or optional integration.
- Full behavioral verification: `npm run verify` passed **759/759**, zero failures, skips or cancellations, **169444.846667 ms**, on the exact candidate above. The new five tests are included in the full count. This is a Developer-run full suite, not independent acceptance.
- Evidence/lifecycle closeout checks: `npm run verify:fast` passed **54/54**; Doctor retained the same 36/1/0 result and the Developer claim was released to Test.
- Self-host Doctor after supported upgrade: **36 pass, 1 pre-existing stale parallel-plan warning, 0 fail**. No parallel dispatch was attempted and the warning was not hidden.
- Author review is not Independent QA. The Developer candidate requires normal downstream Test/Eval/Independent QA review; no merge or release is asserted.

The changes are committed locally. Before any public push, review the inherited private experiment history/publication boundary; this candidate does not authorize publishing that history or bypass the repository review gate.

## Historical integrity and next decision

WI-0234 artifacts, its frozen v2 protocol and original scores remain unchanged. In particular, the Temple strict handoff score remains 2/4, even though its product oracle and administrative completion were each 4/4. New semantics apply only to new output, not a rescore of old prose.

The next instrument uses `continuity-approved/v3`, `continuity-result/v2` and the new bounded output schema. A future comparison must freeze and approve a fresh protocol, qualify the current native runtime and use identical product tasks/model/oracle and reporting schema across arms. Current offline tests do not establish live readiness. Do not reuse WI-0234 approval or compare a new score directly against an old scoring contract as if only performance changed.

There is no new permanent Position, router, observer, dependency or waiver of required instructions, claims, candidate guards, tests, recovery or distinct verification. Remaining live questions are whether models actually avoid repeated work, which observed categories dominate, and whether any change improves quality/time/Tokens on matched tasks. Those questions are deliberately unmeasured here.
