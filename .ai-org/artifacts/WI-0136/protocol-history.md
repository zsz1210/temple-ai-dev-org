# Protocol history

## Representative comparison v1

- Protocol SHA-256: `858f296e1582b5d5570882c85a3c5a773457a7c054ad3d8f194be68855dd6c83`
- Git revision: `15239a247de4c069c27cb82a0783fee176482230`
- Candidate generation: not started
- Evaluator generation: not started
- Disposition: superseded before account approval

Prompt inspection found that the Temple condition required every known Work Item to read `TEMPLE.md` before using the Context Capsule. That order contradicted the framework's routed-context guidance and could add avoidable input without measuring the intended Temple workflow. The v1 fixture and no-generation evidence remain valid as preparation evidence, but v1 cannot support the live comparison result.

The next protocol must freeze the runner digest, use Context Capsule-first retrieval, and pass a focused full-load versus routed-context ablation before the main comparison is approved.

## Context-routing ablation v1

- Protocol SHA-256: `3eff52f42ffc31a74f169aa3f462bb0b8fcb04de2a623a2901508b9c51f64e73`
- Conditions: full-load and routed
- Model route: Terra medium for both conditions
- Candidate turns: 2
- Combined operational-Token hard stop: 160,000
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Candidate generation: not started
- Disposition: superseded before account approval by the context/model diagnostic v2

The ablation freezes the runner, analyzer, fixture, prompt layers, output schema, tool policy, model route, and identical repository revisions. It is diagnostic only and cannot serve as the main Temple-versus-baseline result.

The user requested a directly measured Sol comparison before generation. Because changing the model matrix after approval would invalidate causal interpretation and the approval envelope, v1 was retained in Git history and replaced before any model turn ran.

## Context/model diagnostic v2

- Protocol SHA-256: `09cb2b5a3442d637dfc380537e5f2860c116125ab5472a7ead8853b070da687d`
- Conditions: Terra medium full-load, Terra medium routed, Sol medium routed, and Sol xhigh routed
- Candidate turns: 4
- Per-condition operational-Token hard stop: 80,000
- Combined operational-Token hard stop: 320,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Exact approval: recorded at `2026-09-03T12:30:36Z`
- Live attempt: stopped after 1 completed condition and during the second condition
- Operational Tokens observed before stop: 104,893
- Retry and fallback: 0
- Disposition: superseded by v3 after a command-policy false positive

The four one-attempt conditions answer three separate diagnostic questions: whether routed context preserves recovery while reducing context work, whether Terra and Sol differ under the same medium effort, and what changes when Sol moves from medium to the user's quality-first xhigh configuration. The protocol records end-to-end and turn timing, time to first activity and command, effective output Tokens per second, detailed Token counters, tool-output volume, and objective recovery. It remains a directional diagnostic rather than routing authority or statistical proof.

The runner correctly stopped instead of retrying when Terra routed selected `git ls-tree -r --name-only HEAD`, but the recovery allowlist had omitted this repository-local read-only command. The v2 stopped artifact also retained only the aggregate count and Token total rather than the completed normalized condition record. No Terra-versus-Sol result exists for v2.

## Context/model diagnostic v3

- Protocol SHA-256: `c5e0b069880a079de6fd8030fda3818cee92c809bd834999db2a04ca32be147a`
- Conditions and model routes: unchanged from v2
- Candidate turns: 4
- Per-condition operational-Token hard stop: 80,000
- Combined operational-Token hard stop: 320,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Exact approval: recorded at `2026-09-03T12:48:58Z`
- Live attempt: stopped during the first condition
- Condition at stop: Terra medium with full-load context
- Operational Tokens observed at interruption: 80,621
- Elapsed: 142.914 seconds
- Retry and fallback: 0
- Disposition: no model or context comparison; successor protocol required

V3 adds only `git ls-tree` to the bounded read-only recovery allowlist and retains normalized completed-condition records in any stopped-run artifact. It uses fresh byte-matched repositories and a new protocol digest. The v2 approval does not authorize v3.

The full-load condition crossed its independent 80,000-Operational-Token ceiling before returning a structured completion record, so the runner correctly interrupted it. Because v3 treated every condition failure as a whole-run stop, Terra routed and both Sol conditions did not start. This is evidence that full-load recovery did not fit the approved ceiling in this attempt, but it is not a Terra-versus-Sol or full-versus-routed comparison. V3 also exposed a remaining evidence gap: it retained completed conditions but not normalized telemetry for the interrupted condition.

## Context/model diagnostic v4

- Protocol SHA-256: `c291842d43692df0dd117bec75ed3ed716312125caa0e0d383b2e8b06313d90a`
- Conditions, models, efforts, order, and prompts: unchanged from v3
- Candidate turns: 4
- Per-condition operational-Token hard stop: 80,000
- Combined operational-Token hard stop: 320,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Status: superseded before approval or generation by v5

V4 changes only stopped-condition evidence and isolation semantics. A per-condition Token ceiling becomes a retained censored observation with exact last usage, timing, route, context strategy, tool-activity counters, and stop reason. It does not authorize a retry; the runner proceeds only to independent conditions that have not started. Aggregate budget, program time, Provider, command-policy, protocol, context-strategy, and revision violations remain whole-run stops. V4 keeps the observed ceiling instead of raising it from the failed attempt.

## Context/model diagnostic v5

- Protocol SHA-256: `9c947a32b2e63f771de3bcdfae2f3e95dd8ab69b66a65e812473c28ec04d615f`
- Condition order: Terra routed; Sol routed medium; Sol routed xhigh; Terra full-load
- Routed-condition operational-Token hard stop: 80,000 each
- Full-load operational-Token hard stop: 120,000
- Combined operational-Token hard stop: 360,000
- Wall-clock hard stop: 40 minutes
- Retry and fallback: disabled
- Status: generation disabled until exact account approval

V5 preserves v4's censored-condition isolation and whole-run safety boundaries. It prioritizes the three routed conditions so a later full-load failure cannot erase the model comparisons. The full-load ceiling is raised by 40,000 based on two retained observations: v2 completed full-load before the full-load-plus-partial-routed aggregate reached 104,893, while v3 crossed the prior 80,000 ceiling at 80,621. The other conditions remain at 80,000, so the total rises by 12.5% rather than doubling.

The exact-approved v5 attempt ran from `2026-09-03T13:14:04.701Z` to `2026-09-03T13:25:45.002Z` and retained 233,753 Operational Tokens with zero retry and zero fallback. Terra routed completed at 53,823; Sol routed medium and xhigh were independently censored at 80,156; Terra full-load stopped at 19,618 after attempting a chained shell command prohibited by the frozen command policy. The run also exposed a schema/evaluator mismatch for descriptive `completed_slices` values and a top-level stop-reason ordering defect. The result is diagnostic partial evidence, not a completed comparison or routing decision.
