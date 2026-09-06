# WI-0195 corrected exact-candidate readiness re-review

Reviewer: `agent-lulu`, Quality & Evaluation Engineer, distinct from Developer `agent-rikku`.
Prepared worker: `worker-20260906031833-0034f7a7`.
Exact candidate: `f471caa1662b43084b104d74961253c9ef3fca01`.
Semantic seal SHA-256: `16ca0e5a49495529304e1d69143c2d0dc1a50f920360f42d8a3bef4d12b0c23e`.
Decision: **changes required; not ready for live execution**.

## Corrected predecessor finding

The blocking schema omission recorded in `readiness-review.md` is resolved. The fresh seal contains `TurnStartedNotification` and `TurnCompletedNotification` as well as `ItemStartedNotification`, `ItemCompletedNotification`, and `ThreadTokenUsageUpdatedNotification`. A fresh generation-free provider inspection produced the same contract as the seal, so both turn lifecycle notifications consumed by the WI-0194 executor are now actually sealed rather than supplied only by the replay tests.

`HEAD` was the exact candidate. All 15 sealed executable bindings matched both `git show f471caa1662b43084b104d74961253c9ef3fca01:<path>` and current worktree bytes. The semantic seal digest matched the value above. The archived `before` and `after` source snapshots matched, and all four ordered cases matched their sealed initial fixture and request digests: `support-read:before`, `support-read:after`, `support-injection:after`, and `support-injection:before`.

## New blocking finding: the persisted structured answer is neither bounded nor redacted

The recorder makes a bounded, path-redacted copy in `messages`, but separately assigns the parent's complete `agentMessage` text to `answer`, parses it, and returns that object without applying the same `&lt;fixture&gt;` / `&lt;source&gt;` replacement or a size bound. The runner then writes the full result to both `subject-N.json` and `result-N.json`, and embeds all results again in `results.json`.

This is reachable with a schema-valid answer. A generation-free challenge constructed a support answer whose `summary`, `unresolved`, and `references` contained a private fixture-path marker and whose serialized size was 20,383 bytes. The sealed output schema accepted it because these strings and arrays have no maximum lengths or item counts. Therefore `raw_tool_output_retained: false` and `reasoning_retained: false` remain accurate, but they do not make the retained answer bounded or path-redacted. The earlier review's statement that synthetic final answer text is retained only in bounded form is not true for the `answer` field.

Required rework is to define and enforce a grading-compatible bound and path-redaction policy for the persisted structured answer, apply it before any subject/result/report write, and add a generation-free regression through the actual executor/result path. The correction requires a new exact candidate and seal; this review does not approve editing the current seal in place.

## Other readiness checks

- The seal records sandbox probes with in-workspace write exit `0`, outside-write exit `1`, read-only write exit `1`, no outside file, and zero model calls. Product read-only remains instruction-and-outcome enforcement, not an OS sandbox guarantee.
- Approval validation binds the full seal, model `gpt-5.6-terra`, effort `medium`, exact numerical limits, included quota only, no purchase/top-up/reset, human provenance, expiry, and evidence digest. The fresh approval template is unapproved, so live execution is independently blocked even after technical rework.
- Review validation requires a passed independent review, the seal digest, distinct fixed Developer and reviewer identities, a 40-character candidate revision, task provenance, and exact review-evidence bytes. Every sealed binding must exist with the sealed digest at that reviewed candidate.
- `run-once.json` was absent during this review. Execution creates it exclusively after approval, review, binding, and provider checks and before the first subject. Cases run in sealed order, and `stopReasonFor` prevents later arms after the first mandatory stop.
- The recorder rejects runtime approval requests, memory enablement, external/forbidden tool items, helper writes, product writes, outside writes, extra children, routing drift, malformed schemas, event/actor limits, token limits, and wall limits. It interrupts known active turns on stop, closes the connection, hashes actor identifiers, keeps event metadata bounded, excludes raw tool output and reasoning, and reports unresolved actor cleanup as `unconfirmed`.

## Generation-free evidence

`node --test .ai-org/artifacts/WI-0194/events.test.mjs .ai-org/artifacts/WI-0195/runner.test.mjs` completed with 38 passed, zero failed, zero skipped, in 15,680 ms. A separate verifier confirmed the exact candidate, seal digest, all 15 bindings, current provider contract, both source snapshots, and all four initial-fixture and request digests. A separate schema challenge reproduced the unbounded, path-bearing structured-answer acceptance described above. No model, live subject, retry, fallback, reset, purchase, external write, implementation edit, canonical lifecycle mutation, or commit was performed.

## Remaining limits

Live execution is prohibited by the structured-answer retention defect and by the absence of fresh explicit human approval bound to a corrected seal. Included quota availability and provider delivery behavior remain unverified. The ceilings of eight subject turns, 100,000 Operational Tokens per actor, 800,000 observed aggregate Operational Tokens, eight minutes per actor, 40 minutes overall, and zero retries/fallback/resets are safety limits only; they are not budget confirmation, cost measurement, expected usage, or statistical design.

This review establishes generation-free readiness failure for one exact candidate and seal. It establishes no live compatibility, comparison result, model effectiveness, parent/child token nonduplication, efficiency advantage, or statistical evidence.
