# WI-0139 technical design

## Design decision

Evolve the existing Context Capsule ablation harness in place as protocol v2. Historical WI-0138 reproduction remains available at its recorded Git revision; its retained artifact directory is immutable. The current branch produces only WI-0139 artifacts.

## Typed fact contract

### Single repository

| Field | Type | Meaning |
|---|---|---|
| `requirement_id` | stable ID | governing requirement |
| `duplicate_request_effect` | kebab-case token | observable duplicate behavior |
| `decision_id` | ADR ID | accepted design decision |
| `repository_revision` | 40-character SHA | exact candidate revision |
| `public_tests_passed` | non-negative integer | passed public tests |
| `public_tests_failed` | non-negative integer | failed public tests |
| `unresolved_risk_id` | stable ID | retained risk |
| `safe_next_action_id` | stable ID | bounded next action |
| `authority_source` | repository-relative path | source of product authority |

### Coordinator multi-repository

| Field | Type | Meaning |
|---|---|---|
| `contract_id` | versioned contract ID | governing integration contract |
| `compatibility_policy_id` | stable ID | compatibility rule |
| `component_revisions` | repository-to-SHA object | exact component candidates |
| `completed_slice_ids` | unique string array | completed bounded slices |
| `unresolved_risk_id` | stable ID | retained risk |
| `authority_owner_id` | stable owner ID | lifecycle authority |
| `safe_next_action_id` | stable ID | bounded next action |

Schemas constrain shape and format only. They contain no `const`, answer-bearing `enum`, defaults, examples, or descriptions that disclose frozen values. Evaluator-only expected facts are generated from the fixture before treatment packages are assembled.

Arrays compare as unique sets. Every other typed fact compares exactly. Prose is excluded from the scored contract.

## Historical false-negative regression

Two narrow, deterministic legacy projections operate only on retained WI-0138 values:

- parse a legacy public-test status into passed and failed integer totals;
- extract the leading versioned contract ID from a legacy contract description.

The regression proves that punctuation and explanatory suffixes project to the same facts. It neither reconstructs missing new IDs nor changes WI-0138's recorded objective results.

## Reasoning-effort control

The installed Codex App Server v2 schema exposes turn-start `effort` as an override for that turn and subsequent turns. Its thread `reasoningEffort` value is configured or persisted state and explicitly is not per-turn execution telemetry.

The harness therefore:

1. supplies `model_reasoning_effort` in the ephemeral thread-start config;
2. requires the thread-start response to acknowledge the requested model and configured effort before any turn starts;
3. repeats the same model and effort on turn start;
4. records effective per-turn effort only when a future Provider event or response exposes it;
5. labels current measurements as requested-and-configured, never as execution-proven.

A mismatch blocks protocol preparation. Lack of per-turn execution telemetry does not fabricate a mismatch; it is an explicit observability limitation in the protocol and report.

## Generation-free readiness

Preparation and rehearsal must prove:

- App Server request schemas accept the exact thread and turn requests;
- model listing supports the requested route;
- ephemeral thread start acknowledges the configured route without starting a turn;
- typed output schemas are Provider-portable and answer-free;
- matched repositories, treatment isolation, command policy, cleanup, and stopped-run behavior still pass;
- adversarial wrong facts fail;
- retained WI-0138 false-negative examples project correctly;
- Operational Tokens and candidate-turn count remain zero.

Only after these checks pass may the harness write a WI-0139 live protocol and unapproved approval template. The later `run` command still requires a byte-matching affirmative approval record.

## Risks and controls

- **Answer leakage:** reject schemas containing `const`, `enum`, `default`, or `examples`; inspect prompts for frozen values.
- **Historical drift:** verify no diff under `.ai-org/artifacts/WI-0138/**` relative to the WI-0138 closing revision.
- **False semantic tolerance:** normalize only the two known legacy display forms; score new candidates directly as typed values.
- **Reasoning overclaim:** keep `effective_turn_reasoning_effort` null until directly observed.
- **Accidental spend:** this implementation slice does not call `turn/start`; a separate exact WI-0139 approval is required for a live run.

