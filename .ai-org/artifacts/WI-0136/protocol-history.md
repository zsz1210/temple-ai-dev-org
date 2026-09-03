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
- Status: generation disabled until exact account approval

The ablation freezes the runner, analyzer, fixture, prompt layers, output schema, tool policy, model route, and identical repository revisions. It is diagnostic only and cannot serve as the main Temple-versus-baseline result.
