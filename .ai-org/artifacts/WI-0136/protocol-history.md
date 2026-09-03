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

## Context-recovery qualification v6

- Protocol SHA-256: `74f581c82408340462f1c65ef6a0666847c40ac4750303d08c5adb60ee6c153f`
- Condition order: Terra routed; Terra full-load
- Routed Operational-Token hard stop: 80,000
- Full-load Operational-Token hard stop: 120,000
- Combined Operational-Token hard stop: 200,000
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Status: generation disabled until exact account approval

V6 does not repeat the censored Sol conditions. It narrows the remaining gate to the two matched Terra medium context strategies required by the risk review before the main Temple-versus-minimal comparison. The exact slice IDs are now part of the Provider output schema, the evaluator consumes those same IDs, stopped results remain analyzable, and causal command-policy failures are no longer masked by a later context-sequence check.

The exact-approved v6 attempt stopped before candidate generation. The Provider rejected the first turn's strict output schema because `uniqueItems` is outside the supported Structured Outputs subset. It observed zero conditions, retained zero Operational Tokens, and performed no retry or fallback. The raw stopped record incorrectly marked model generation as performed; that telemetry defect is preserved and explained in `context-recovery-qualification-v6-pre-generation-stop-report.md`. V6 produced no candidate result and is not evidence about Terra or context routing.

## Context-recovery qualification v7

V7 is the corrected successor to v6. It retains the same two Terra medium context conditions and approved ceiling design, removes the unsupported `uniqueItems` keyword without weakening the exact enum and array-length contract, validates the exact output schema against the documented Provider subset before generation, and records zero-usage pre-generation failures accurately. Its protocol digest and exact approval are separate from v6.

- Protocol SHA-256: `5f20f1143394b4e0b6cc19d2a8736029ca4c54e361b93a04310556ec75d6f92d`
- Condition order: Terra routed; Terra full-load
- Operational-Token hard stops: 80,000 routed; 120,000 full-load; 200,000 combined
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Status: stopped after the routed condition; no valid context comparison

The exact-approved v7 attempt completed an objectively correct Terra routed recovery within 73,381 Operational Tokens, but the command sequence was `temple-md`, `context-resolve`, `context-resolve`. Because the routed treatment required `context resolve` first, the runner stopped before the full-load condition. There was no retry or fallback. V7 demonstrates one correct recovery, but it does not isolate the routed strategy and is not a Temple-effectiveness result.

## Context-recovery qualification v8

V8 corrects the intervention order exposed by v7. The prompt now identifies WI-0001 as a known bounded Work Item, places the condition-specific first action before repository inspection, and explicitly forbids the routed condition from reading `TEMPLE.md` before `context resolve`. Prompt-order regression checks cover both conditions.

- Protocol SHA-256: `c0d4aaefd74419487fd7541f03c4fe1355661df24e1981d2a8897ee371510683`
- Condition order: Terra routed; Terra full-load
- Operational-Token hard stops: 80,000 routed; 120,000 full-load; 200,000 combined
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Status: stopped after both conditions; no valid context comparison

The exact-approved v8 attempt produced a correct routed recovery at 67,042 Operational Tokens and an invalid full-load recovery at 24,370, for 91,412 combined. The full-load candidate looked for `TEMPLE.md` in the experiment root instead of `coordinator/TEMPLE.md` and returned no revisions or governing contract. V8 also counted context command attempts without proving exit-code-zero completion. There was no retry or fallback. These values are not comparable efficiency evidence.

## Context-recovery qualification v9

V9 repairs the fixture boundary exposed by v8. It uses root-relative Coordinator paths, supplies the pinned local Temple CLI path inside the isolated runtime, and records treatment sequence only for successful command completions. Preflight executes the exact root-relative resolver command in both matched fixtures and validates its returned Context Capsule.

- Protocol SHA-256: `6ad30fd488aa57c0bc3318161a2f00b7cb7ade97b20e1fcbaffedc5bd0e81715`
- Condition order: Terra routed; Terra full-load
- Operational-Token hard stops: 80,000 routed; 120,000 full-load; 200,000 combined
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Status: stopped during full-load recovery; no valid context comparison

The exact-approved v9 attempt successfully observed routed `context-resolve` and full-load `TEMPLE.md → context-resolve`. Routed recovery passed at 50,255 Operational Tokens. Full-load was stopped at 19,892 after the command policy rejected `git -C gateway rev-parse HEAD`; combined observed usage was 70,147. There was no retry or fallback. Because full-load has no completed recovery result, the values are not comparable efficiency evidence.

## Context-recovery qualification v10

V10 retains v9 treatment delivery and adds fixture-scoped variants of the already approved read-only Git subcommands. `git -C` is accepted only for the five exact fixture repository IDs; traversal and unapproved Git subcommands remain rejected. Generation-free preflight verifies every expected repository-scoped revision command in both conditions.

- Protocol SHA-256: `f1a3da3550d5751581a049e0e17085948517eea5caa8b40c63e744c495fef33f`
- Condition order: Terra routed; Terra full-load
- Operational-Token hard stops: 80,000 routed; 120,000 full-load; 200,000 combined
- Wall-clock hard stop: 20 minutes
- Retry and fallback: disabled
- Status: generation disabled pending exact v10 approval

V10 preserves the v9 route, effort request, context treatments, condition ceilings, aggregate ceiling, and no-retry/no-fallback account boundary. Its new digest reflects the bounded command-policy expansion and fresh matched-fixture revisions. It is a new experiment, not a retry or continuation of v9.
