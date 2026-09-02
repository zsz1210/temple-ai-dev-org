# Live execution status — WI-0117

- Four candidate turns: **completed**
- Public tests: **4 / 4 passed**
- Hidden acceptance: **4 / 4 passed**
- Candidate operational Tokens: **122,226 / 240,000 approved**
- Retry / fallback: **0 / 0**
- Independent evaluator attempt 1: **stopped at the approved 20,000-Token boundary**
- Owner-approved replacement attempt 2: **stopped by a score-scale contract defect**
- Scores frozen: **no**
- Mapping joined for a qualified comparison: **no**

The provisional candidate-only differences are consistent across both cases: Temple used 3,735 (+13.29%) and 2,915 (+9.82%) more operational Tokens, while finishing 2,485 ms (-4.82%) and 336 ms (-0.60%) faster. These values are not a qualified comparison until a fresh independent evaluator completes and freezes its scores.

The first evaluator attempt showed that a 20,000 operational-Token cap is below the observed fresh Luna Medium context baseline. The owner then approved one separate replacement at 40,000 operational Tokens and ten minutes. That evaluator completed structured output, but the runner rejected a `weighted_score` outside 0..1 because the output schema and prompt had not encoded the validator's normalized scale. The invalid result was not frozen, the mapping stayed sealed, and the zero-retry boundary was preserved.

The runner now constrains `weighted_score` to 0..1 in both its JSON Schema and prompt and retains bounded failure diagnostics. No third model turn has been run or implicitly authorized. The experiment therefore remains **inconclusive**, not negative: all four candidates passed objective acceptance, while subjective quality equivalence remains unqualified.
