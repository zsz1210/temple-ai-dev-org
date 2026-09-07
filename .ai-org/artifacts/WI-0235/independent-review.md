# WI-0235 independent Quality Evaluator review

Reviewer: Lulu (`agent-lulu`), Position `quality_evaluator`, Principal `human`.
Developer: Rikku (`agent-rikku`). Claim: `claim-20260907085155-67cdc35e`;
worker: `worker-20260907085155-7760e3ab`. Date: 2026-09-07.

## Candidate and decision boundary

Review target: `68be154276fe2648a35eadf6c3e59c665ced2ea9`, compared with
`0e4936be`. The checkout HEAD was `2fc0013986ea6218c394772e0cfaaaa88aca6148`;
later changes were evidence and bookkeeping. Before and during verification,
`git diff --name-only 68be154 -- scripts src test bin packs project-overlay package.json package-lock.json .agents TEMPLE.md temple.lock`
returned no paths. This pins the executed behavioral content to the Developer
candidate; it does not claim the entire working tree was a clean checkout.

The repository Assignment and active Work Item claim resolve this reviewer as
Lulu, distinct from the Developer. Compact context reports Standard profile,
Test stage, and the same Developer revision. Its selection digest was
`sha256:6b36eb64e3b43da60653a0b95ec177517e978f16104f5e500bfa697478e36b16`.
The initial mistyped Position `quality-evaluator` was rejected with
`GUARD_REJECTED`, `mutation_status: not_started`; the canonical underscore ID
was then used successfully. No guard was bypassed. The learning registry had
no active Practices or validated Lessons to apply.

Decision: PASS for WI-0235's bounded offline acceptance criteria, with the
nonblocking measurement caveats below. This report is Test/Eval evidence, not Release
Gate approval, publication authority, or a live-runtime qualification.

## Acceptance-derived inspection and tests

- Governance and installed recipe: read the whole installed AGENTS/TEMPLE
  contract, temple-work Skill, parallel/recovery procedures, Lean execution
  reference, design and Developer handoff/report. The changed recipe preserves
  native/bootstrap reads, effective profile, explicit actor/claim, real tests,
  exact revision, distinct verification, and failure recovery. `finish` remains
  optional and does not require `context enter`; only successful unchanged
  diagnostics can be reused. The full suite exercises installation/upgrade and
  real local fixture completion, including protected project-owned policy and
  one handoff/released claim/Test ownership.
- Handoff semantics: the new schema separates blockers, downstream declarations
  and next owner, without changing canonical Work Item fields or parsing old
  prose. Independent adversarial checks reject null/object/uppercase-SHA/extra-
  field output, nonempty blockers, null test result, wrong next owner, and an
  independently failed product oracle. A valid completion with unperformed
  downstream review passes only with the supplied passing oracle. Source:
  `scripts/continuity-delivery-contract.mjs:6`, `:32` and runner `:453`.
- Runtime versus code evidence: the local installed CLI fixture executes real
  administration; the provider tests execute mocked event/permission boundaries.
  Neither proves the current native provider can perform a model-selected tool
  call. Native instructions, protected paths, oracle, usage, first-stop and
  cleanup guards remain present. No live provider/model/API call was initiated
  by this review; full-suite browser-harness fixture output is not a real-browser
  gate result.
- Telemetry: independently tested UTF-8 bytes, unavailable versus empty output,
  event deduplication, bounded item count, absence of raw data in serialized
  counters, unknown wrapper attribution and unknown native/total context bytes.
  The existing tests additionally exercise the 2 MiB field cap and limit guards.
  Authored request size does not include native context, source reads, cache or
  provider formatting. Source: `scripts/continuity-observations.mjs:5`, `:30`,
  `:52`.
- Historical integrity: `git diff --name-only 0e4936be 68be154 -- .ai-org/artifacts/WI-0234 scripts/continuity-codex-adapter.mjs`
  returned no paths. Legacy schemas and recorded results are unchanged. The
  full suite tests rejection of old v1/v2 approvals before consuming them.
  No earlier outcome is rescored and no measured Token/speed benefit is claimed.

## Reproduced nonblocking measurement caveats

1. `classifyObservedCommand('sed -i s/old/new/ quote.mjs')` returns `reading`.
   Classification keys on the executable, not semantic intent
   (`scripts/continuity-observations.mjs:17`). This is not a permission bypass,
   but the category must not be described as proven reading work. Classifying
   known editing flags as editing/unknown would improve a later instrument.
2. Shell-wrapped simple reads/navigation return `unknown`, for example
   `/bin/zsh -c "cat SPEC.md"` and a similarly wrapped compact context command
   (`scripts/continuity-observations.mjs:14`). This conservative result is
   appropriate; actual native category coverage is unmeasured. A high unknown
   share cannot justify a causal overhead breakdown.
3. Replaying the same completed command event twice makes top-level
   `completed_commands` equal 2, while the new deduplicated
   `command_observations.completed_items` equals 1 and `duplicate_events` equals
   1 (`scripts/continuity-live-runner.mjs:151`, observation helper `:40`).
   The first counter predates this change and counts completion events. Use the
   deduplicated field for unique command reporting; do not silently treat the
   two values as interchangeable. This does not alter the product oracle.

## Reviewer execution provenance

Runtime: Node.js `v24.20.0`, macOS, repository-local dependencies. Full command:
`npm run verify > /tmp/wi0235-lulu-verify.log 2>&1`. This was launched independently
by Lulu; the Developer's 759-pass report is not reused as reviewer execution.
Result: exit 0, **759 passed, 0 failed, 0 cancelled, 0 skipped**, reported test
duration **187096.3845 ms**. Repository, Markdown link and package checks passed
as part of that command. The installed-recipe test passed and reported compact
output of 3722 bytes; this remains fixture structure evidence, not live savings.
Report-only follow-up: `npm run verify:fast > /tmp/wi0235-lulu-review-fast.log 2>&1`
exited 0, **54/54 passed**, zero failures/skips/cancellations, **1157.527959 ms**.
Final behavioral-content comparison still returned no paths. This paragraph
records that completed result; it introduces no behavioral change.

An additional `node --input-type=module` stdin probe imported the three changed
modules and executed 21 assertions, exit 0. It tested seven malformed/blocking
completion variants, failed/passing oracle results, the three category examples
above, duplicate-event counts, six UTF-8 bytes for two CJK characters, one-item
limit coverage, raw-data omission, empty/unavailable output, unknown total
context, and the ordinary-arm blocker schema. All 21 passed. The category and
duplicate counterexamples are observations of limitations, not semantic passes.
No source/test files were edited by the reviewer.

The measurement counterexamples can be replayed without a provider or fixture:

```sh
node --input-type=module <<'JS'
import {classifyObservedCommand} from './scripts/continuity-observations.mjs';
import {createSubjectLedger} from './scripts/continuity-live-runner.mjs';
for (const command of ['sed -i s/old/new/ quote.mjs', '/bin/zsh -c "cat SPEC.md"'])
  console.log(classifyObservedCommand(command));
const ledger = createSubjectLedger({threadId:'t',turnId:'u',remainingTokens:1000,deadline:100,now:()=>0});
const event = {method:'item/completed',params:{threadId:'t',turnId:'u',item:{type:'commandExecution',id:'one',command:'cat SPEC.md',exitCode:0}}};
ledger.accept(event); ledger.accept(event);
console.log(ledger.state.completed_commands, ledger.state.command_observations.completed_items);
JS
```

Expected/reproduced output: `reading`, `unknown`, `2 1`.

SHA-256 of reviewed runtime modules:

- `scripts/continuity-observations.mjs`: `b336da7d50bafc570bbf7472abbf7a17958c9df5273ec0a801e3c0e91a98f40e`
- `scripts/continuity-delivery-contract.mjs`: `327fb8a4cfa0e83091f7ca731da08de9b542425050994b0b1aaa627ace0bb8c9`
- `scripts/continuity-live-runner.mjs`: `b2fb683bd7280bb9d1c30f12ac5d035a3352dc51d7858baac9cea874b890f1d3`

## Four-subject follow-on decision

The WI-0235 candidate has no observed blocking instruction, acceptance or privacy
defect for its bounded offline scope. Its eight-subject configuration is deliberate,
not a defect against this Work Item. It cannot execute WI-0236 as currently
specified: `envelope` fixes eight subjects/800000 Tokens/sixty minutes and
`runApprovedContinuity` requires eight subjects/four pairs (`:18`, `:424`).

Proceed with WI-0236 preparation only after joining this review. Before live
dispatch, separately verify its four-subject/two-pair/400000-Token/forty-minute
candidate, freeze and bind a new protocol, and perform the planned generation-free
native/runtime/oracle qualification. The first authorized subject remains the
canary; no extra probe or retry is inferred. These are planned follow-on gates,
not hidden WI-0235 failures. Report product, handoff, administration, all-attempt
usage/time and telemetry coverage separately. Four subjects cannot establish
general efficiency or causal command-level Token savings.
