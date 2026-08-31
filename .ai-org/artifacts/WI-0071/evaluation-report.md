# WI-0071 Quality Evaluation

- Evaluated revision: `406bc213d7b4d0345c4a6f90f5895cc77de4aa7a`
- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Result: pass for Independent QA

## Acceptance evaluation

1. Candidate detection is deterministic and read-only. The tests verify the exact four positive conditions, aggregation across derived Lessons, explicit near-miss blockers, and byte-stable input.
2. Proposal creation is restricted to an eligible Practice and an active Design-stage Tech Lead claim. Unsafe names, existing Skill paths, and duplicates fail before a second proposal is created.
3. Approve, reject, and defer are all exercised. Reject and defer create no Work Item; defer requires a future review time; approval replay returns the same authoring Work Item.
4. The approved Work Item is internal, starts at Intake, is parented to the review item, and contains the bounded project Skill path. Neither the proposal nor approval writes `SKILL.md`.
5. Proposal, Learning Index, and authoring Work Item correlation is validated. Corruption fails schema validation and appears as `invalid_skill_promotion` Observer attention.
6. Candidate, pending, due, and invalid attention states are covered. The rendered Observer HTML includes the proposal ID and authority boundary, while Management Console Now retains the read-only action payload.
7. Risk classes reuse `low`, `standard`, `high`, and `critical`. The later authoring Work Item receives progressively stronger validation acceptance text; every class still requires explicit proposal approval.
8. Managed schema source and installed copy are byte-identical, and `temple.lock` records the new digest.

## Regression result

- Full `npm run verify`: 249 passed, 0 failed.
- Doctor: healthy with 0 failures.
- Existing stale parallel-plan warning is unrelated to this Work Item and does not authorize dispatch.

## Challenge notes

- The first full run found a failure in Doctor's invalid-Learning diagnostic path. It was corrected and the complete suite was rerun successfully.
- Proposal overlap remains a Tech Lead judgment recorded as text; exact path collision checking does not claim semantic overlap proof.
- Approval does not prove the Skill routes well. Forward testing and Independent QA remain obligations of the generated authoring Work Item.
- No model-backed retrospective scheduler, automatic Skill authoring, low-risk standing authorization, dependency installation, publication, or external action is included.

## Recommendation

Advance the exact candidate to Independent QA. Independent QA should reproduce the focused promotion workflow, challenge authority and idempotency boundaries, and confirm the candidate revision remains unchanged.
