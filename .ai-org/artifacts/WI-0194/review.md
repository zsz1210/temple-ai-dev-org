# WI-0194 local candidate review

Reviewer: `agent-lulu`, Quality & Evaluation Engineer, distinct from Developer `agent-rikku`.
Candidate: `c68fb23c3106302767c978727ccb05c750b5f22a`.
Decision: changes required. This is bounded Lean local verification, not Standard Independent QA, release authorization, or live compatibility evidence.

## Blocking findings

1. Metadata recording can throw before schema validation. `event-policy.mjs` passes arbitrary `item.type` into `Object.hasOwn`, which coerces objects. A JSON event containing `item.type: {"toString": null}` or `{"toString":"SECRET"}` makes `EventJournal.record` throw `Cannot convert object to primitive value`. The observed report has `total_events: 1`, no retained events, and `first_failure: null`. `executor.mjs` calls `journal.record` outside its handler's try/catch, so this defeats the required safe failure path. An array type `["userMessage"]` is also wrongly classified as observation and retained as the raw array. Require primitive string checks and safe bounded representation of malformed types; exercise the actual notification callback with those values.

2. Schema-invalid events from an unbound actor disappear from cleanup accounting. A generation-free replay through `runSubject`, using freshly generated installed schemas, emitted `item/completed` with `threadId: "unknown-child"`, `turnId: "tc"`, and unknown item type, then acknowledged the known parent's interrupt with a valid terminal notification. The result correctly stopped at `schema-invalid:ItemCompletedNotification`, and the journal retained the unknown actor's hash, but cleanup reported `observed-terminal` with `unfinished_actor_ids: []`. Validation occurs before tracker buffering; cleanup consults only tracker actors, activity hints, and pending events. Preserve bounded untrusted actor hints before validation and retain cleanup uncertainty without granting actor binding or interruption authority from those hints.

## Verification and scope

Independently ran `node --test .ai-org/artifacts/WI-0194/events.test.mjs`: 30 passed, 0 failed, approximately 6.26 seconds. This covers all 19 installed item kinds, explicit schema drift rejection, both early/late child replay orders, failed/interrupted spawn, journal retention, malformed turn, and predecessor byte equality. The focused suite currently misses the two counterexamples above. The parent owns full repository verification; this review does not claim its pending result.

Read the design, handoff, event policy, tracker, executor, and tests. The explicit policy union and validated-spawn binding improve the predecessor's unknown-item handling. Activity alone does not bind children, and completed parent/child replay does not claim nonduplicated aggregate usage. These positive observations do not waive the failures above.

No model generation, comparison retry, implementation edits, canonical lifecycle mutation, or commits were performed by this reviewer. Only this report was written. Sealed WI-0193 remains outside the edit scope. Re-review must name the repaired exact candidate and rerun relevant deterministic failure paths; live compatibility and missing comparisons remain unproven.
