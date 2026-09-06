# WI-0197 independent readiness review

## Decision

**Passed for a later, separately approved live compatibility probe.**

This review covers only the generation-free preparation and the exact executable candidate `963aa834f4b3c660bef83287e87cf7d0912192e7`. It does not authorize model generation, Credits, reset, automatic top-up, retry, fallback, release, or merge.

Reviewer: Quality Evaluator `agent-lulu` (Lulu), runtime `/root/wi0197_readiness`. The Developer candidate is attributed to `agent-rikku`; the identities are distinct.

## Exact reviewed inputs

- Canonical seal object SHA-256: `2e3817ebedce79b7a5743ec9e1533f8e4dd6f49dc8a9320144a83d83505b69fe`.
- Candidate revision: `963aa834f4b3c660bef83287e87cf7d0912192e7`.
- All 15 sealed executable bindings matched `git show` at that candidate; no mismatch was observed.
- Current Provider contract SHA-256 matched the seal: `a41021e9095789a3a9ea7ecc4f2bd87ada99e82d388eb8d96e892b578ba9014d`.
- Current source snapshot matched the seal: `6bd51ac1452bc3274b62c2b0c1f9fe8edcd0797fb66fcdca149872c19c8cd231`.
- Current initial fixture snapshot matched the seal: `88afad022df0d36f292c3b370678aa6f06397366af7bc42bc5f3a58c661f306d`.
- Current request matched the sealed request SHA-256: `b6908359c54d4cf57e7c68d0add62077a2f16e98b74f6ee4f681258a2468c468`.
- The seal covers request, response, item, turn, and per-thread usage schemas required by the runner.

## Bound execution envelope

The reviewed protocol contains one `support-read / after` arm, one parent and at most one helper, `gpt-5.6-terra` at `medium`, 160,000 Operational Tokens per actor, a conservative 320,000 aggregate counter, 360,000 ms per actor, and 900,000 ms overall. It fixes retry to zero and forbids fallback, reset, Credit purchase, and automatic top-up.

The approval template remained `approved: false`; the review template remained `pending`. Invoking the runner with those templates failed with `approval-required` and exit code 1 before creating `run-once.json`, `result-*.json`, or `results.json`. The retained lab contained none of those execution files after the denial check.

## Acquisition and persistence audit

- The runner imports the WI-0196 executor and native tracker. An activity-discovered child remains quarantined until `thread/resume` confirms the exact child ID, model, and non-null exact reasoning effort; only then is the child bound and buffered evidence replayed.
- One child is the hard maximum. Nested or foreign spawn, a second candidate, extra child turns, helper writes, route mismatch, usage inconsistency, and cleanup uncertainty produce named stopped outcomes.
- There is no retry loop or fallback branch. Exclusive creation of `run-once.json` prevents a second execution of the retained lab.
- Provider output remains in memory until `sanitizeResult` finishes. Fixture and source paths are replaced before the first result write; messages, observations, native errors, structured answers, and the whole serialized result are bounded. Only the sanitized value is written to `result-1.json`, followed by the aggregate report.
- The result path retains no prompt, hidden reasoning, raw tool output, unhashed thread ID, or raw command/output payload. The generation-free seal deliberately retains the exact synthetic subject input needed to bind the request; it is not copied into a result.

## Generation-free checks

```text
node --test .ai-org/artifacts/WI-0197/runner.test.mjs .ai-org/artifacts/WI-0196/events.test.mjs
28 passed, 0 failed

npm run verify
632 passed, 0 failed
```

Additional no-model checks compared the live installed Provider schema bundle, current executable bindings, source snapshot, initial fixture snapshot, and reconstructed request with the retained seal; all matched. Preparation and review performed zero model calls.

## Residual limits

- This is readiness evidence, not evidence that the installed Provider will successfully expose one native helper during a live turn.
- Provider usage is last-observed per thread, not account-final. Parent and helper Token observations must not be summed as cost or savings until non-duplication is established.
- Token and wall ceilings are diagnostic stop boundaries. They do not establish expected consumption, price, or statistical performance.
- Any candidate, seal, Provider contract, source, request, approval evidence, or review evidence drift must stop execution. A live probe still requires a fresh, expiring, exact human approval record.

## Unresolved items

None within generation-free readiness. The live compatibility outcome remains deliberately unobserved.
