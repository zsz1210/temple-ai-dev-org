# WI-0143 preapproval summary

## Readiness result

- Frozen protocol: `084e7ac3ae67c1c4a093fe832cd23728d03c440ddeca95a74fbf45bbb062536b`
- Bound implementation revision: `1c703bf56ee616880fe900f7004e37ccc9d436c8`
- Generation-free rehearsal: passed every check.
- Installed Provider handshake: passed with Codex CLI `0.153.0-alpha.5`.
- Preflight: every check passed except `exact-approval`.
- Model generation so far: none.
- Operational Tokens used by preparation: zero.

## Proposed live envelope

- 8 candidate turns and 0 evaluator turns;
- `gpt-5.6-terra`, `medium`, for every condition;
- 51,000 Operational Tokens per single-repository turn;
- 80,000 Operational Tokens per multi-repository turn;
- 524,000 aggregate Operational Tokens;
- 4,800,000 ms (80 minutes) wall-clock limit;
- Pro included allowance only;
- no Credits purchase, automatic refill, or usage reset;
- zero retry and zero fallback;
- no external writes;
- matched-pair cache-share tolerance of 2 percentage points;
- no causal efficiency claim if correctness, acquisition coverage, or cache balance fails.

## Exact approval text

> Approve WI-0143 under protocol 084e7ac3ae67c1c4a093fe832cd23728d03c440ddeca95a74fbf45bbb062536b for eight Terra medium candidate turns, at most 524,000 Operational Tokens and 80 minutes, using only the included Pro allowance, with no Credits purchase, automatic refill, usage reset, retry, or fallback. Use the two-percentage-point matched-cache-share threshold; if quality, acquisition coverage, or cache control fails, retain descriptive results only and make no causal efficiency claim.
