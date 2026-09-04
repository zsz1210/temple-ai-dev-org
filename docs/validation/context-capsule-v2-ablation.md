# Context Capsule v2 effectiveness experiment

- Status: generation-free preparation passed; live candidate turns require exact approval
- Work Item: `WI-0138`
- Question: does stage- and purpose-aware context reduce unnecessary input while preserving exact cold-handoff recovery?
- Scope: one single-repository fixture and one coordinator-led multi-repository fixture

## Why this experiment exists

WI-0137 changed Temple's context selection from an expanded, mostly unscoped route to a Context Capsule that considers the current lifecycle stage and the requested purpose. The implementation is only useful if it helps a fresh Agent recover the same task truth with less irrelevant material.

This experiment therefore changes only the context treatment. It is not a Temple-versus-no-Temple comparison, a model benchmark, or a price estimate.

## Compared conditions

Each project shape receives two fresh, read-only candidate turns:

| Condition | Context available to the candidate |
|---|---|
| `legacy-expanded` | Unscoped route material plus the full `TEMPLE.md` operating contract |
| `stage-aware` | Context Capsule v2 sources selected for the exact stage and purpose; `TEMPLE.md` remains a recovery fallback |

Repository revisions, task truth, model, reasoning effort, command policy, output schema, retry policy, fallback policy, and evaluator stay matched. The fixed interleaved order is:

1. single-repository, stage-aware;
2. multi-repository, legacy-expanded;
3. single-repository, legacy-expanded;
4. multi-repository, stage-aware.

All four conditions use `gpt-5.6-terra` with requested `medium` reasoning. Each condition has one attempt, zero retry, and zero fallback. There is no model evaluator because correctness is checked deterministically against frozen expected fields.

## What is measured

Correctness is the gate for every efficiency conclusion. A condition must recover the required product or contract, exact revisions, completed work, unresolved risk, authority source, and safe next action.

The retained observation then separates four kinds of measurement:

| Measure | Meaning |
|---|---|
| Source bytes | Deterministic size of repository files selected by the context treatment |
| Provider Tokens | Non-cached input, cached input, output, operational, and gross Tokens when reported |
| Time and tool activity | Elapsed time, first activity, commands, tool-output bytes, and `TEMPLE.md` reads |
| Process integrity | Retry, fallback, reroute, intervention, rework, path-policy result, revisions, and clean trees |

Missing Provider telemetry remains unknown. Source bytes are not Tokens, money, or a billing estimate.

## Generation-free result

The preparation and injected rehearsal completed without model generation. Both pairs contain identical repository manifests and different context-selection digests.

| Project shape | Legacy sources | Stage-aware sources | Legacy bytes | Stage-aware bytes | Static reduction |
|---|---:|---:|---:|---:|---:|
| Single repository | 12 | 7 | 40,093 | 14,389 | 64.11% |
| Coordinator-led multi-repository | 10 | 6 | 34,164 | 11,644 | 65.92% |

These figures prove that the fixture exposes a real context-treatment difference. They do **not** prove Token, latency, correctness, or cost improvement; those outcomes require the approved live turns.

The rehearsal also verifies fixture parity, strict output schemas, command and path boundaries, stopped-run retention, child-process cleanup, zero retry, zero fallback, and a generation-disabled Provider handshake.

## Reproduce the preparation

Use a disposable lab under the operating system temporary directory:

```bash
lab_root="$(node -e 'console.log(require("node:os").tmpdir())')/temple-wi0138-context-capsule-ablation"

node scripts/run-context-capsule-ablation.mjs prepare \
  --lab-root "$lab_root"

node scripts/run-context-capsule-ablation.mjs rehearse \
  --lab-root "$lab_root"

node scripts/run-context-capsule-ablation.mjs preflight \
  --lab-root "$lab_root"
```

The unapproved preflight is expected to fail closed with `exact-approval` as its only blocker. It performs no candidate generation.

After a protocol-specific approval has been recorded, the bounded live command is:

```bash
node scripts/run-context-capsule-ablation.mjs run \
  --lab-root "$lab_root" \
  --approval .ai-org/artifacts/WI-0138/account-approval.json
```

The runner refuses a second attempt in the same lab. Any stopped condition is preserved rather than silently retried.

## Registered live boundary

- Candidate turns: 4
- Model: `gpt-5.6-terra`
- Requested reasoning: `medium`
- Single-repository ceiling: 40,000 Operational Tokens per condition
- Multi-repository ceiling: 80,000 Operational Tokens per condition
- Aggregate ceiling: 240,000 Operational Tokens
- Program wall-clock ceiling: 40 minutes
- Retry, fallback, reroute, reset use, Credits purchase, and automatic refill: disabled
- Network and external writes: disabled

These are safety ceilings derived from retained bounded observations, not expected consumption.

## How to interpret the live result

The report keeps single-repository and multi-repository outcomes separate:

- `supported`: both conditions are correct, and stage-aware context reduces Tokens or latency without increasing the other by more than 5%;
- `quality-regression`: stage-aware context misses an objective field that legacy recovers;
- `overhead-regression`: both are correct, but stage-aware increases Tokens or latency by more than 5% without an offsetting reduction;
- `neutral`: both are correct but no registered boundary is reached;
- `inconclusive`: a condition stops or required telemetry is unavailable.

One pair per shape is diagnostic evidence. It cannot establish statistical significance, a universal savings claim, model superiority, monetary savings, or automatic routing authority.
