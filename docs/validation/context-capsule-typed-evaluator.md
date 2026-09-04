# Context Capsule typed evaluator

Status: generation-free design and implementation in progress under WI-0139. No successor Provider comparison has run.

## Why the evaluator changed

The WI-0138 comparison recovered the right repository state, but the scorer rejected two harmless presentation differences:

- `18 passed.` did not equal the frozen string `18 passed`;
- a correct `OrderPlaced/v2` identifier followed by a compatibility explanation did not equal the bare identifier.

Those are evaluator failures, not recovery failures. WI-0138 remains officially inconclusive because experiment results are immutable after observation. WI-0139 fixes the next protocol instead of rewriting the old one.

## What the new test measures

Candidates return stable facts rather than prose:

- requirement, decision, contract, compatibility, risk, action, and authority IDs;
- passed and failed test counts as integers;
- exact Git revisions;
- a repository-relative authority path;
- unique completed-slice IDs.

The Provider-facing JSON Schema checks object shape and primitive types. A deterministic local validator checks ID syntax, non-negative totals, SHA length, relative-path safety, and list uniqueness. The exact evaluator then compares those validated facts with evaluator-only expected values.

This split is deliberate. The installed Codex Structured Outputs compatibility check does not accept regex patterns, numeric minima, or array uniqueness in the portable schema subset. Moving those checks into deterministic code retains strictness without sending answer-bearing `const` or `enum` values to the model.

## Historical regression without a model call

The harness reads the retained WI-0138 observation and projects only the two known display-sensitive fields:

| Retained display value | Typed projection |
|---|---|
| `18 passed.` | `public_tests_passed: 18`, `public_tests_failed: 0` |
| `OrderPlaced/v2: ...` or `OrderPlaced/v2 — ...` | `contract_id: OrderPlaced/v2` |

Both treatment arms must project to the same values. The adapter does not create the new requirement, risk, or action IDs and does not rescore WI-0138.

## Reasoning-effort evidence

[OpenAI's model guidance](https://developers.openai.com/api/docs/guides/latest-model) recommends setting reasoning effort intentionally and comparing configurations on representative tasks. The installed App Server accepts an `effort` override at turn start. Its thread `reasoningEffort` response is configured or persisted state and explicitly is not per-turn execution telemetry.

The successor protocol therefore distinguishes:

- `requested_reasoning_effort`;
- `acknowledged_configured_reasoning_effort` before generation;
- `effective_turn_reasoning_effort`, which remains `null` until directly observable.

A requested/configured mismatch blocks generation. Reports may say “requested-and-thread-configured Terra medium”; they may not claim that effective per-turn effort was measured.

## Generation-free commands

```sh
node --test test/context-capsule-ablation.test.mjs
node scripts/run-context-capsule-ablation.mjs prepare
node scripts/run-context-capsule-ablation.mjs rehearse
node scripts/run-context-capsule-ablation.mjs preflight
```

`prepare` validates the installed App Server schema, starts only an ephemeral thread to confirm model and configured effort, and does not call `turn/start`. `rehearse` uses injected typed facts. The unapproved `preflight` must stop with `exact-approval` as its only blocker.

## Live-run boundary

A later Provider comparison requires the exact WI-0139 protocol digest, its matching approval template, explicit human approval, and another successful preflight. The WI-0138 approval cannot authorize WI-0139. Preparation and rehearsal do not permit retries, fallback, Credits purchase, automatic refill, reset use, merge, release, or publication.
