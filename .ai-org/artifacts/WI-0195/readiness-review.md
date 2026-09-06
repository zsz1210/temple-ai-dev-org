# WI-0195 exact-candidate readiness review

Reviewer: `agent-lulu`, Quality & Evaluation Engineer, distinct from Developer `agent-rikku`.
Prepared worker: `worker-20260906031213-34f5fb4b`.
Exact candidate: `a21b7b24ad5290d92c4139a7071900a54e387450`.
Semantic seal SHA-256: `7360ef1695808ffa1c83bb1f990369e6cc3188e091377acb4b32a6b490ab52d6`.
Decision: **changes required; not ready for live execution**.

## Blocking finding

The sealed installed-provider contract omits both `TurnStartedNotification` and `TurnCompletedNotification`. Its schema map contains only `ItemCompletedNotification`, `ItemStartedNotification`, `ThreadResumeParams`, `ThreadStartParams`, `ThreadTokenUsageUpdatedNotification`, and `TurnStartParams`.

The exact-candidate WI-0194 executor maps live `turn/started` and `turn/completed` events to those two missing schemas and calls `validate`, which fails closed with `schema-missing:TurnStartedNotification` or `schema-missing:TurnCompletedNotification`. A normal live turn therefore cannot be validated under this seal. Because the notification can be processed only after `thread/start` / `turn/start`, this is not an acceptable compatibility-gate stop: model work may already have begun before the harness discovers its own incomplete contract.

The generation-free focused suites do not catch this inconsistency. They pass because the WI-0194 replay tests generate the schemas they need locally, while the WI-0195 tests verify ordering, approval fields, and binding presence without asserting that the sealed contract covers every notification schema consumed by the executor.

Required rework is to make the frozen provider contract and executor-consumed schema set complete and consistent, add a generation-free regression that exercises this exact sealed-contract boundary, then generate a new seal and obtain a new exact-candidate readiness review. This report does not approve editing the existing seal in place.

## Confirmed checks

- `HEAD` was the exact candidate. Every sealed executable binding matched both that Git revision and the current worktree bytes.
- The semantic seal digest matched the value above. The current generation-free provider inspection matched the sealed provider contract; this confirms the omission is reproducible, not post-seal drift.
- The four ordered arms were exactly `support-read:before`, `support-read:after`, `support-injection:after`, and `support-injection:before`. All four request digests, initial fixture snapshots, and archived source snapshots matched the seal.
- The sealed sandbox probes recorded allowed in-workspace write exit `0`, denied outside-write exit `1`, denied read-only write exit `1`, no outside file, and zero model calls. Product read-only remains instruction-and-outcome enforcement, not an OS sandbox guarantee.
- Exact approval enforcement binds the semantic seal, model `gpt-5.6-terra`, effort `medium`, numerical limits, included quota only, no purchase/top-up/reset, human provenance, expiry, and evidence digest. The current approval template is unapproved.
- The runner creates `run-once.json` with exclusive creation before subject execution, processes cases in sealed order, and stops after the first result that yields a mandatory stop reason. No run-once marker existed during this review, and the live runner was not executed.
- The recorder bounds retained event metadata, hashes actor identifiers, excludes raw tool output and hidden reasoning, interrupts known active turns on stop, closes the connection, and reports unresolved actor cleanup as `unconfirmed` rather than terminal proof. Synthetic final answer text is retained in bounded form for grading, with fixture/source paths redacted.

## Generation-free evidence

`node --test .ai-org/artifacts/WI-0195/runner.test.mjs .ai-org/artifacts/WI-0194/events.test.mjs` completed with 37 passed, zero failed, zero skipped, in approximately 15.1 seconds. A separate read-only binding/fixture/provider comparison confirmed all bindings, snapshots, and request digests above and reproduced the six-key incomplete sealed schema map. No model, live subject, retry, fallback, reset, purchase, external write, or implementation mutation was performed.

## Remaining live limits

Live execution remains prohibited first by the blocking contract defect and then, after a repaired candidate and new seal pass review, by the need for fresh explicit human approval bound to that new seal. Included quota availability and provider delivery behavior remain unverified. The ceilings of eight subject turns, 100,000 Operational Tokens per actor, 800,000 observed aggregate Operational Tokens, eight minutes per actor, 40 minutes overall, and zero retries/fallback/resets are safety limits only; they are not a budget confirmation, cost measure, expected usage, or statistical design.

This review establishes generation-free readiness failure for one exact candidate and seal. It establishes no live compatibility, comparison outcome, model effectiveness, parent/child token nonduplication, efficiency advantage, or statistical evidence.
