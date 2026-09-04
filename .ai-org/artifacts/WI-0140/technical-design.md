# WI-0140 technical design

## Decision

Evolve the existing controlled-comparison harness to protocol v3 and write all new mutable outputs under `WI-0140`. The retained WI-0139 observation is read-only predecessor evidence. The experiment continues to use isolated disposable repositories and the installed Codex App Server contract.

## Acquisition observation

Command actions exist in memory only while a turn runs. On successful completion, the harness normalizes each action into a bounded metadata record. A record contains no command or content:

```json
{
  "repository_id": "coordinator",
  "path": "docs/product/idempotency.md",
  "access_kind": "read",
  "classification": "routed",
  "reported_output_bytes": 812
}
```

The manifest has a fixed entry limit, fixed path-length limit, allowlisted repository IDs, deterministic ordering, and an overflow counter. If one command contains multiple actions, output bytes remain `null` because attribution is ambiguous. File-size and returned-output measurements are not conflated.

## Normalization and safety

Use structured `action.path` when available. Parse only the already allowlisted command shapes needed to recover a missing path. Resolve candidates against the exact disposable condition root, canonicalize links, and reject anything outside the declared repository roots. Git metadata probes become `required-evidence` and never masquerade as document reads.

Path classification compares normalized paths with the condition's frozen `CONTEXT_PACKAGE.json` sources and declared fallback. Exact file matches and descendants of a selected directory are routed. Unknown observations stay unknown.

## Metrics

Each condition reports:

- total and unique observed path counts;
- routed, permitted-fallback, off-route, control, required-evidence, and unknown counts;
- classifiable context-read count;
- policy-adherent count and percentage when the denominator is known and non-zero;
- routed share percentage;
- returned output bytes by classification when attribution is known;
- overflow and incomplete-coverage flags.

Analysis compares acquisition metrics only when both matched arms complete correctly. Censored or failed conditions retain observations but produce no exact treatment delta.

## Balanced protocol

Eight candidate turns form two repetitions per strategy and shape. Repetition B reverses each shape's strategy order relative to repetition A. Each condition has a unique ID and fresh disposable clone. Aggregate limits are the exact sum of per-condition hard limits: four single-repository conditions at 51,000 and four multi-repository conditions at 80,000, totaling 524,000 Operational Tokens. The wall-clock ceiling is fixed before generation.

## Compatibility and immutability

- WI-0139 artifacts are hashed before and after preparation and testing.
- The WI-0139 observation remains a regression fixture for the reported overhead and censoring behavior.
- Existing typed completion schemas remain answer-free and keep deterministic local validation.
- The new approval schema binds all eight condition IDs, order, limits, model, effort, zero retry, and zero fallback.

## Risks and controls

- **Sensitive command retention:** commands and output content never enter the artifact.
- **Path escape:** canonical path checks reject traversal, absolute-path disclosure, and symlink escape.
- **False adherence:** failed, ambiguous, unknown, or overflowed observations cannot increase adherence.
- **Metric inflation:** per-action output bytes are recorded only for a single unambiguous completed action.
- **Order bias:** treatment order reverses in repetition B.
- **Repeat spend:** the run remains generation-disabled until a new exact approval exists; retries and fallback remain zero.
