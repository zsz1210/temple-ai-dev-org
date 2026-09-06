# WI-0216 independent readiness review

Status: PASS (passed). Reviewer: agent-lulu, quality_evaluator. Developer: agent-rikku. Exact reviewed source: `570a36acbe70ef2e4c6f435f5aa1c6d1c87e9474`.

This review accepts readiness for the single authorized v2 Full, Model, Model, Full comparison. WI-0216 owns the warning-policy implementation and readiness; child WI-0217 owns the newly authorized live execution and its results. The protocol remains identified as WI-0216. This is not evidence of completed comparison, release, or permission for retries. The user explicitly requested completing preparation followed directly by comparison, as recorded in design.md and WI-0217. Its applicable named gates remain required before live execution.

## Exact bindings

- Protocol: `sha256:abf8d24ebc769bc4363f274e0482b781ef357630c7836db38d6f75e225b7f6ea`
- Instrument: `sha256:9e9b1deca46068c5967f9c8f48aab7dc4f7dda136fcadcc7f0dad1b7c4039651`
- Source: `sha256:a509b2b16eb64c5dd2a685e73e3ea3ebd8519641b9685cbb6d2ce88ab90cf162`
- Sandbox: `sha256:52ce4b21582c8d6ed5bbd270b8dd15fd59b082559d5aa4232283cc8f743d332c`

## Independent checks

Reviewed the warning-policy delta from `faa9cd76`, current implementation, routed claim, developer handoff and verification, approved design and subsequent live authorization, usage policy, exact fresh protocol, sandbox result and one-shot approval validation. The reviewer and Developer are distinct Identities. No applicable active Practice or validated Lesson was found in the bounded learning-index search.

Independent offline checks passed: 57 format/command-policy/delivery-control tests plus 15 material/isolation/sealing tests, **72/72**, zero failed, skipped or cancelled. These include injected-provider real fixture lifecycles, immutable candidate checks, product rejection, malformed/missing usage, interruption, command containment and prior protocol behavior. No model generation was performed by this reviewer. The recorded full 664-test verification covers behavior commit `92cb0a01`; the difference through the exact reviewed source contains only documentation and organization records. The full suite was not redundantly rerun here.

Read-only readiness passed before and after the sandbox probe. It checks source HEAD/bytes and instrument, fixture files/revisions/Git safety, request digests, isolation source pins and installed request schemas. The inspected sandbox result passed all four subjects with zero turn requests, identical packet source bodies and entry digests across formats, and denied outside-subject writes. Each probe emitted 84529 Full bytes and 79542 Model bytes; these are not inference Token measurements. The prior WI-0215 laboratory seal independently verified unchanged.

## Warning and stopping policy

Only explicit v2 `per_stage_token_action: warning` removes the stage Token hard stop. Crossing 80000 records the first observed crossing and elapsed time once; subsequent notifications do not overwrite it. Legacy protocols lacking the flag still stop. Invalid actions and malformed counters fail closed. The aggregate guard includes Tokens consumed by previous stages and still stops above 640000; no new stage starts at an exhausted aggregate allowance. Usage regression and missing usage remain failures.

The existing runtime timer still enforces the earlier of six minutes per stage and the 48-minute aggregate deadline. New executor checks also reject expiration after preparation, after stage completion and after assessment, including the final stage. Quality, exact completion-record agreement, selected-format observation, workflow evidence and confirmed provider exit remain mandatory. No retry, fallback, reset, purchase, refill or extra model judge is permitted; only the subscription allowance is authorized.

## Boundaries and limitations

No blocking implementation issue was found. The initial canonical offline-only scope was not silently expanded: the new child WI-0217 explicitly records live scope and acceptance. Its owner must bind the fresh approval and complete remaining named pre-execution gates.

Token events are provider observations; interruption follows a reported crossing and is not an exact billing ceiling. Warning-only stages can consume the remaining aggregate allowance, so the overall stop may still leave the comparison incomplete. Cache is uncontrolled and two deliveries per format cannot establish a general efficiency claim. Any failure remains a stopped, sealed partial result rather than an automatic retry.

The inherited evidence scope excludes six exact top-level runtime directories although this protocol has four subjects. The unused fifth and sixth exclusions are broader than necessary, currently absent, not subject roots and outside actor write authority. They do not exclude current durable subject evidence. Git metadata is separately excluded with Git-safety checks retained. This disclosed limitation is unchanged; the review does not claim every laboratory byte is sealed.
