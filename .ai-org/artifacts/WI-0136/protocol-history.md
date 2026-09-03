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
- Status: generation disabled until exact account approval

The four one-attempt conditions answer three separate diagnostic questions: whether routed context preserves recovery while reducing context work, whether Terra and Sol differ under the same medium effort, and what changes when Sol moves from medium to the user's quality-first xhigh configuration. The protocol records end-to-end and turn timing, time to first activity and command, effective output Tokens per second, detailed Token counters, tool-output volume, and objective recovery. It remains a directional diagnostic rather than routing authority or statistical proof.
