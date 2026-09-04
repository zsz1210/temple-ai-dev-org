# WI-0143 independent QA

## Decision

Pass the experiment evidence and fail closed on the efficiency claim.

The exact candidate `e02ab92ca845858fb519c0ca0daafadc2c63a8b9` preserves the approved protocol, live observation, analysis, runner, tests, and human-facing method. Developer identity `agent-rikku` is distinct from Independent QA identity `agent-lulu`.

## Reproduction

- 13 focused Context Capsule tests passed with zero failures.
- Repository rules and documentation-link checks passed.
- The runner, focused test, method document, protocol, live observation, and analysis have no diff from the exact candidate revision.
- Protocol and account approval validation passed.
- Recomputed analysis exactly matched the retained analysis.
- All eight conditions completed and all objective outputs passed.
- Observed Operational Tokens sum exactly to 233,040 and remain below the 524,000 ceiling.
- Acquisition coverage is complete for both shapes with zero unknown and zero off-route reads.
- Retry, fallback, human-intervention, and rework counts are zero.

## Challenge result

The evidence does not support a causal routing-efficiency claim. The single-repository maximum paired cache-share difference was 2.31 percentage points, above the frozen 2-point limit. The multi-repository maximum was 11.15 points. The retained analysis correctly marks both cache-control assessments failed and the overall causal claim false.

This is not a failure of the experiment: the measurement answered the decision question without changing the rule after seeing results. It is evidence against adopting one universal efficiency claim or automatic routing change from this sample.

## Release boundary

The documentation, reusable runner profile, objective observation, and limitation-aware report are suitable for review and integration. Release readiness does not authorize a new experiment, threshold adjustment, model comparison, public claim, publication, or production action.
