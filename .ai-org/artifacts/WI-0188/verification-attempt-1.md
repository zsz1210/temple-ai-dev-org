# WI-0188 rejected attempt

Candidate `88ab5970b8410f3b4baa99be50ff26796bb51250` did not pass full verification or Independent QA.

Full `npm run verify`: 629 tests, **628 passed, 1 failed**, 159.605 seconds. Failure: `test/skill-policy.test.mjs` still expected the previous three-file Skill reference set after this slice intentionally added the fourth installed procedure. The exact allowlist must be updated, not removed. Log SHA-256: `b565c33ac5d19d7e8f7bbff0bb8b5b5dc318185a3f600a9667ad0ecb75bc8278`.

Independent QA additionally reproduced a valid Work Item with draft shared contract and explicit shared reference receiving an eligible entry. That contradicts the accepted ambiguous-contract fallback. `independent-qa.md` preserves the original rejection. Same-scope rework restores the existing stable/not_required rule with an actual CLI regression, stale-preview rejection and positive stabilized control.

Implementation discovery adds `test/skill-policy.test.mjs` to the concrete repair write scope: this existing structural contract test is necessary for the already approved core reference, not a new capability or acceptance downgrade. No nonterminal Work Item declared an overlapping path when inspected. The launcher does not support updating affected_paths through configure; the unsupported request made no mutation. This artifact records the additional test path without hand-editing canonical Work Item JSON or expanding functional scope.

The corrected candidate requires fresh complete verification and independent acceptance; no first-attempt pass is reused as final evidence.
