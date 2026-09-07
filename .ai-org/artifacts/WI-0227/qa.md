# WI-0227 sequential Test, Eval and Independent QA

Exact behavioral candidate: `f706239624b3fe9748767ea58128ebf5a2b587ea`.
Reviewer: `agent-lulu`, Principal `human`; Developer: `agent-rikku`.
The reviewer is a different Identity from the Developer. Test/Eval and Independent
QA are distinct judgments below; this artifact does not authorize release or publication.

## Test — passed

Independently ran `node --test test/operating-contract.test.mjs`: 2/2 passed,
zero failures/skips/cancellations, 4310.456208 ms. Disposable installation tests
verified whole instruction/procedure delivery to Builder and distinct Verifier,
all linked procedure destinations, old whole-source handling, managed upgrade,
custom native instruction preservation, stale entry rejection, and refusal to
overwrite changed managed or untracked content. Test-only lock edits stayed inside
the disposable fixture and are not proposed as a real upgrade technique.

The Developer report records the exact candidate's complete `npm run verify`:
698/698 passed, zero failed/skipped/cancelled, 172370 ms. This is explicitly reused
Developer evidence, not an independently repeated full suite. Current behavioral
files match that candidate; the intervening commit changes only WI-0227 evidence,
state and views. Against baseline `34c4fb71`, the only changed distributed/runtime
source is `project-overlay/TEMPLE.md`; native AGENTS, Skills, algorithms and gates
are unchanged. The dedicated test and measurement driver were also reviewed.

## Evaluation — passed

Independent generation-free measurement replay completed using
`.ai-org/artifacts/WI-0227/measure.mjs` and its same-fixture assertions:

| Actor | Baseline full JSON | Candidate full JSON | Reduction |
| --- | ---: | ---: | ---: |
| Builder | 89622 | 85647 | 3975 |
| Distinct Verifier | 94476 | 90501 | 3975 |

Source counts remain 16 and 18 respectively. Model-view reductions are also 3975
bytes. Raw source-body reductions are 4015 bytes. The Verifier absolute output is
one byte larger than the Developer report in both arms due to variable fixture
metadata; this does not change the paired result. TEMPLE is 10737 versus 14752
bytes; AGENTS remains 7086 bytes. Candidate instruction SHA-256 values:

- TEMPLE: `eb77e0a0d26c449814f57dde268c7eb6cec5ac2db55014af3669a6bb04eda080`
- AGENTS: `2dc46c464766b4fe45fb27cc3fdd29c7357fe837db9035d0c7f07c6e9864bce3`

The fixture includes the same whole Skill and Lean execution reference in both
arms; no new normal Build/Test follow-up body is required. Existing applicable
unselected project/provider instructions remain obligations outside this packet.
This establishes a modest deterministic cold-entry output reduction, not a Token,
latency, quality, model-following or complete-session efficiency improvement.
No lower cost is claimed for initialization, recovery, UI, High-Assurance or tracker
exceptions; their existing whole procedures remain required and reachable.

The brief's bounded structural outcome is satisfied: both cold actors receive
smaller complete serialized entries with identical source sets, preserved normal
follow-up obligations and no added default, selector or capability. This judgment
accepts the measured instruction refactor only, not a general efficiency claim.

## Independent QA — passed

Final semantic review compares the complete baseline and candidate TEMPLE bodies
alongside unchanged native AGENTS and the referenced existing lifecycle procedures.
Prior omissions were corrected: the four specialized Skill triggers and the
external-reference tracker prerequisite remain explicit. Normalized exact
revision-matched Evidence IDs are explicit. Final compatibility wording preserves
the native bootstrap/import and sequential/parallel meanings; AGENTS is unchanged.

The reviewed preservation map covers read-only authority, exact managed ownership,
approved/current scope, candidate/evidence binding, Position/Identity separation,
distinct Verifier/QA, bootstrap continuity, triggered parallel/support procedures,
UI and High-Assurance requirements, tracker/telemetry non-authority, intentional
learning promotion, integration permissions, same-request recovery and bounded
experiment stop rules. No concrete lost necessary obligation, broken destination,
broadened permission or unsupported efficiency claim was found.

Independent QA revalidated exact candidate equivalence after the Test/Eval handoff.
The final distributed TEMPLE, dedicated test, measurement driver, source and scripts
remain identical to the reviewed candidate; root project-owned instructions and
distributed AGENTS remain identical to baseline. Distinct-from-Developer review,
reproduced installation/upgrade checks, preservation mapping and appropriately
bounded measurements support advancement to Release Gate. No unresolved candidate
finding remains. This is not Release Manager closeout or approval to integrate.

No source or test was edited by this reviewer. No live model experiment, account
action, external write, merge, push, release or publication was performed.

The supported sequential transitions are complete through Release Gate, owned by
`release_manager` / `agent-mog`, with no active claim and no unresolved WI-0227
coordination conflicts. The Work Item remains non-terminal; no closeout was done.
Final compact Status confirms the exact candidate above. Doctor reports 36 pass,
1 warning, 0 fail: the existing generated parallel plan is stale and must be
rebuilt before any future dispatch. This sequential review did not dispatch work
or alter that plan. Post-transition `npm run verify:fast` passed repository,
documentation-link and package-boundary checks and all 54 tests, with zero
failure, skip or cancellation (1813.958291 ms test duration). Review evidence and
canonical state changes remain uncommitted for the parent to inspect.
