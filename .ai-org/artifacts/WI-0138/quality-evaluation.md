# WI-0138 Quality evaluation

- Candidate revision: `87d0f8e2c4d1ab62e646a3bd76c8ee4409aed3c2`
- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Result: experiment execution and arithmetic pass; effectiveness conclusion remains inconclusive

## Independent reproduction

- Recomputed `effectiveness-analysis.json` from the frozen protocol and retained live observation; the normalized object matched exactly.
- Re-ran the five Context Capsule ablation tests; 5/5 passed.
- Re-inspected the temporary lab; the protocol, lab digest, four treatment packages, repository parity, and both treatment-difference checks passed.
- Confirmed four completed candidates, 106,300 Operational Tokens, zero retry, and zero fallback.

## Result validation

| Shape | Legacy Operational Tokens | Stage-aware Operational Tokens | Delta | Legacy / stage-aware correctness |
|---|---:|---:|---:|---|
| Single repository | 24,689 | 23,833 | -3.47% | false / false |
| Coordinator-led multi-repository | 28,381 | 29,397 | +3.58% | false / false |

The arithmetic and registered `inconclusive` outcomes are reproducible. Both single-repository conditions failed only `public_test_status`; both multi-repository conditions failed only `governing_contract`.

Inspection of the structured completions confirms that the single-repository mismatch is a trailing period and the multi-repository mismatch is correct explanatory text appended to the exact contract identifier. Because the protocol froze byte-exact equality, these outputs cannot be rescored as passing after observation.

## Quality finding

The experiment harness safely completed, retained the required evidence, and reported its own evaluator limitation. The live evidence does not support a claim that stage-aware context reduces Operational Tokens or latency. It does support the narrower claim that selected source bytes and observed tool-output bytes were reduced in these fixtures.

Requested reasoning effort was `medium`, observed thread effort was `high`, and effective turn effort was unavailable for all conditions. The treatments remain matched, but model-effort-specific performance language is not supported.

## Required follow-up

Before another Provider run, replace the two narrative-string fields with typed facts and prove the revised evaluator against all four retained completions without generation. The existing protocol and four turns must remain immutable.
