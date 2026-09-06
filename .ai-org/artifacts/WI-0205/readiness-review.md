# B/C measurement readiness review

Verdict: **BLOCKED for candidate 5fd0646b9d3aaba10daf6e3b8cb19c96f23afc8a** pending correction and complete verification of the negative verifier-write regression. This is instrument readiness review, not a subject model run, product authorship, release approval, or spending authorization.

Reviewer: agent-lulu, quality_evaluator, WI-0205, distinct from Developer agent-rikku. Canonical compact context confirmed the active prepared claim and exact candidate. Review writes are confined to this evidence file.

## Exact bindings

- Accepted B/C product base: 7c9c1b88b96b8d334c5c0a88bd287f473ce4fc42.
- Reviewed instrument candidate: 5fd0646b9d3aaba10daf6e3b8cb19c96f23afc8a.
- Independently computed source SHA-256: 9f32384485622c870ec0d5d0b806ef70611d3746ada95dde8720465c9876a7fd.
- Independently computed process contract SHA-256: 5534554a64fd0531814acc6691acdd51d4db8fae57a79eb2c59d5ecd9c7c5301.
- Both hashes match WI-0203/sandbox-readiness.json. Git comparison of bin, src, project-overlay, packs, package.json and package-lock.json against B/C base is empty.

## Independent checks

Read design.md, developer-evidence.md, sandbox-readiness.json, command-policy and instrument diff, changed tests, relevant observation/assessment and source-freeze code. Ran `node --test test/delivery-command-policy.test.mjs test/optimized-delivery-comparison.test.mjs`: 18 passed, zero failures/skips, 98.366208 ms. These are focused editing/review checks, not full-verification evidence.

Additional read-only executable probes passed: a valid fresh Verifier receipt; rejection for false success, absent historical flag, failed Status rebuild, Doctor failure, wrong Work Item, and wrong resulting state; six-category accounting reconciliation across seven completions, 15 returned bytes and 29 observed milliseconds; unknown command classification; unavailable patch-output measurement; unavailable inference Token attribution. No test source was changed by the reviewer.

The reviewed sandbox record reports four completed stages, correct Test/done handoff and released distinct claims, passing product oracle, two denied outside-write checks, and zero provider thread/turn requests. Its generator explicitly uses installed provider command/exec with a zsh envelope and checks a completed comparable synthetic lifecycle before writing the report. Reviewer inspected this evidence and matching source; did not independently repeat the installed-provider runtime.

Command policy binds entry/finish to the arm, stage Position, Identity, Principal, Work Item, current claim, exact candidate and accepted Verifier evidence. Current finish requires applied non-preview mutation and fresh successful full diagnostics. Workflow assessment additionally checks actual canonical state and handoff. Cost metadata retains classifications, HMAC command identifiers, lengths and observed timing, not raw command/output text. Missing observations remain incomplete; command durations are not additive wall time, repeated hashes do not prove redundancy, and model inference Tokens are not allocated by output bytes.

## Blocking verification finding

Parent full-suite log `/tmp/wi0203-full.log` reports 630/632 passed, with the failing `fresh verifier cannot edit product` subtest plus its parent. In test/delivery-control-pair.test.mjs the out-of-band injected edit occurs after product tests but before finish. When the randomly chosen first arm is Temple, finish rejects the dirty candidate before post-stage write-scope assessment; the synthetic runner surfaces `provider-protocol`, while the assertion requires a later write-scope/public-file/verifier-product reason. This is a test expectation/order gap, not evidence that a forbidden write was accepted, but the candidate does not meet the required full-verification gate.

Correction should exercise both orders explicitly, retain ordinary post-assessment scope rejection, and require specific finish guard evidence plus nonacceptance for the earlier Temple rejection. Merely accepting any provider-protocol error would hide unrelated failures. Recompute source bindings, rerun changed tests/full verification, regenerate bound sandbox evidence and review the corrected candidate before generation.

Nonblocking usability observation: topic-specific help for context enter/work-item finish is absent from the literal allowlist; the documented top-level help is supported. No additional feature expansion is required by this review.

## Limits and next owner

The one-pair-per-model plan can diagnose local overhead, not establish statistical reliability, a general Temple win, or a model ranking. Order/cache and excluded coordinator inference remain disclosed. Freeze a new protocol and independent budget/approval binding only after readiness gates pass. Root owns worker/lifecycle operations and subsequent authorized execution; this reviewer launched no model, network action, or new runtime.
