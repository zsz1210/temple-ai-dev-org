# WI-0106 technical design

## Staged design

Wave 5 is split so that a cheap instrumentation failure cannot consume the budget for a full study.

### Wave 5A — process-comparison feasibility

Run two synthetic cases under two conditions, for four sequential model turns total:

- `temple`: the starter repository is initialized with the pinned Temple revision and its bounded task is routed through the declared Position and Work Item context;
- `minimal`: the same starter product code, product brief, hidden acceptance suite, safety restrictions, and QA rubric are present, with only a concise repository instruction and task record instead of Temple.

Both conditions use `gpt-5.6-luna` with `max` reasoning, the same Codex version, local sandbox, approval policy, tool allowlist, network prohibition, one-turn limit, and zero retry or fallback. The condition order is derived from the SHA-256 case ID so it is fixed before launch. A single concurrent turn avoids host-load and shared-account interference.

The two cases are:

1. `idempotent-command`: repair a duplicate-command defect in a small Node.js state machine without changing its public contract;
2. `compatible-event-evolution`: add backward-compatible producer/consumer event handling while preserving the older fixture.

Each pair starts from byte-identical product sources and tests. Condition-specific organizational files are applied only after the pair base digest is recorded.

### Wave 5B — process qualification

Wave 5A must first prove complete correlation, usable measurements, stable grading, and bounded resource use. A later protocol computes the required case count from the observed paired distribution and a predeclared minimum meaningful effect. It must not simply reuse two cases or stop when a favorable result appears.

### Wave 5C — matched model-profile evaluation

This is a separate Temple-only study using the existing `temple.matched-model-evaluation/v1` contract. The initial candidate pair is the project Seed Policy's `standard` profile (`gpt-5.6-terra`, `medium`) and `lightweight-quality` profile (`gpt-5.6-luna`, `max`) for one exact task shape. It begins only after Wave 5A establishes reliable capture and after a separate budget approval. Critical planning with Sol XHigh is not mixed into this implementation-shaped dataset.

## Quality rubric

An evaluator receives condition-blinded candidate packages labeled only by case and arm code. Each package contains the candidate revision, diff, test outputs, and bounded handoff; it contains no raw prompt, response, hidden reasoning, credential, or raw Provider payload.

| Dimension | Weight | Failure rule |
|---|---:|---|
| Hidden acceptance correctness | 0.45 | Any required behavior failure rejects the candidate |
| Scope and safety compliance | 0.20 | Any prohibited external action or out-of-scope write rejects the candidate |
| Maintainability | 0.15 | Scored against a case-specific static rubric |
| Reproducible evidence | 0.10 | Missing exact revision or test evidence rejects the candidate |
| Handoff and recovery clarity | 0.10 | Scored from the bounded handoff only |

The minimum weighted score is `0.85`, with no rejection rule triggered. Resource comparison occurs only between quality-passing members of a pair.

## Measurements

- Provider-reported input, cached-input, output, reasoning-output, and total Tokens;
- rate-card-equivalent Credits with model, rate source, effective date, and formula, clearly separated from billed account cost;
- turn and end-to-end elapsed time;
- first-pass acceptance, defect count, QA findings, rework turns, and human interventions;
- setup time, condition-specific retained bytes, context files and bytes opened, and changed paths;
- exact model, requested and observed reasoning, Codex version, case digest, starting revision, candidate revision, and outcome.

The Provider-owned launch registers the task before generation and writes usage to the participant Git common directory. The run stops if the Provider does not acknowledge the requested model, usage capture is not ready, correlation is lost, the repository is dirty, a forbidden path changes, or any ceiling is reached.

## Resource preflight

The retained `WI-0067` run is the only directly comparable live Luna Max envelope measurement: two interrupted turns reported 148,648 total Tokens in 29.201 seconds, including 145,745 input Tokens, 114,176 cached-input Tokens, and 2,903 output Tokens. The average was 74,324 Tokens per attempted turn. Its 60,000-Token reactive limit overshot by 14,266 and 14,382 Tokens before interruption, so a Token threshold is not a billing guarantee.

Using the public 2026-09-02 Codex token rate card (`5` Credits per million uncached input Tokens, `0.5` per million cached-input Tokens, and `30` per million output Tokens), that observed two-turn mix equals approximately `0.302023` rate-card Credits. The linked page labels these rates for Business and Enterprise/Edu flexible pricing while the personal Credits article routes readers to that rate card; exact applicability to this personal Pro account is therefore unverified:

```text
uncached input = 145,745 - 114,176 = 31,569
Credits = 31,569/1M*5 + 114,176/1M*0.5 + 2,903/1M*30
        = 0.302023
```

This is a planning conversion, not proof of the user's billed amount. Personal Pro included usage is consumed first; purchased Credits may be used after an included limit is reached. The local account probe exposes availability and aggregate summaries but not an enforceable per-experiment billing reservation.

### Proposed Wave 5A ceilings

| Control | Warning | Hard stop | Basis |
|---|---:|---:|---|
| Model turns | 2 | 4 | Two cases by two conditions; no replacement turn |
| Attempts | 2 | 4 | Exactly one attempt per declared turn |
| Concurrent turns | 1 | 1 | Avoid host and account interference |
| Per-turn total Tokens | 50,000 | 80,000 | Below and just above the observed 74,324-turn level |
| Aggregate total Tokens | 200,000 | 320,000 | Four times the per-turn controls |
| Per-turn wall time | 5 minutes | 10 minutes | Safety limit, not a duration forecast |
| Program wall time | 30 minutes | 60 minutes | Allows fixture and evaluator overhead without concurrency |
| Per-repository disk growth | 64 MiB | 128 MiB | Product fixtures contain no dependency or container install |
| Aggregate disk growth | 256 MiB | 512 MiB | Above the 304,959,488-byte Wave 3 container peak without authorizing Docker |
| Retry / fallback | 0 | 0 | Preserve independent attempts and prevent runaway use |

At the retained `WI-0067` Token mix, 320,000 Luna Tokens would be about `0.6503` rate-card Credits. The mathematical worst case if all 320,000 Tokens were charged at Luna's output rate is `9.6` Credits. Neither figure guarantees the actual plan charge or prevents a reactive overshoot.

## Required approval before Wave 5A

The execution Work Item may start only after the owner confirms all of the following together:

1. four sequential Luna Max turns and the ceilings above are approved;
2. automatic Credit reload is disabled for a strict no-new-payment run, or an explicit purchased-Credit ceiling is approved;
3. consuming included Pro allowance is acceptable;
4. the two synthetic cases and quality rubric are accepted;
5. stopping after any uncorrelated or interrupted turn is acceptable, even if that leaves no comparison result.

The runtime must still fail closed. A human approval cannot turn unavailable billing data into a guarantee.
