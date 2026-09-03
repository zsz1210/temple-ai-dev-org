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
- Exact approval: recorded at `2026-09-03T14:35:12Z`
- Live attempt: completed both conditions once
- Operational Tokens observed: 128,039
- Retry and fallback observed: 0
- Status: qualification complete; routed context selected for the main comparison

V10 preserves the v9 route, effort request, context treatments, condition ceilings, aggregate ceiling, and no-retry/no-fallback account boundary. Its new digest reflects the bounded command-policy expansion and fresh matched-fixture revisions. It is a new experiment, not a retry or continuation of v9.

The exact-approved attempt ran from `2026-09-03T14:35:32.396Z` to `2026-09-03T14:42:08.099Z`. Both Terra medium candidates completed without censoring, retry, or fallback. Routed context recovered all four exact service revisions and every other objective recovery field at 57,296 Operational Tokens. Full-load context used 70,743 Operational Tokens and returned every other required field, but truncated the Notifications revision from 40 to 39 hexadecimal characters, so it recovered 3 of 4 exact revisions and failed the objective recovery gate.

In this one matched pair, routed context used 13,447 fewer Operational Tokens (19.01%), finished 55.245 seconds sooner (24.52%), issued 8 fewer commands, and surfaced 96,062 fewer tool-output bytes. Because objective quality was not equal and there is only one observation per condition, these are descriptive results, not a population estimate or an automatic model-routing rule. The successful routed recovery qualifies Context Capsule-first retrieval for the replacement main Temple-versus-minimal comparison. Full evidence and interpretation are in `context-recovery-qualification-v10-report.md`.

## Representative comparison v3

- Protocol SHA-256: `e38b4052462db8206a868cfc24a7a90ed6fe896fe09e8d78de4adbeb7de128ea`
- Exact approval: recorded at `2026-09-03T15:22:53Z`
- Candidate Operational-Token hard stop: 525,000
- Evaluator Operational-Token hard stop: 100,000
- Combined Operational-Token hard stop: 625,000
- Wall-clock hard stop: 45 minutes
- Retry and fallback: disabled
- Status: stopped during the first arm's Build wave; no comparison result

V3 stopped after observing 144,372 Operational Tokens. The model changed the allowed `src/order-event.mjs`, but the harness trimmed the leading space from `git status --porcelain=v1` and then removed a fixed three-character prefix, misreading the path as `rc/order-event.mjs`. No arm completed and the evaluator did not start. This is harness evidence, not evidence against either experimental arm.

## Representative comparison v4

- Initial protocol SHA-256: `1aa274148ad8616fa8d14bd067eb43b004504ec74786c0afcbbb7b0c631c1b7d`
- Current protocol SHA-256: `b01f96b48bb585e4b24390fa0b0c322d2abfc03d8f99650fa9b07a3da4932c71`
- Models, efforts, candidate count, safety limits, retry policy, fallback policy, and network boundary: unchanged from v3
- Harness repair: accept exact Git porcelain records both before and after the shared command helper trims leading whitespace
- Stopped evidence: retain completed arms and normalized active Design, Build, and Integration observations
- Exact approval: recorded at `2026-09-03T15:49:07Z`
- Live attempt: completed one arm, then stopped at the Temple Design Token limit
- Operational Tokens observed: 335,914
- Retry and fallback observed: 0
- Status: stopped; no matched comparison result

V4 uses fresh matched repositories and a new runner digest. The v3 approval cannot authorize it, and the stopped v3 lab cannot be resumed or retried. The first approval-aware v4 preflight performed no model generation and failed closed because Codex CLI changed from `0.151.0-alpha.7.2` to `0.153.0-alpha.5` after the initial freeze. The experiment inputs, routes, resource limits, and retry policy were left unchanged; only the inspected Provider version and wire-schema digests were refreshed.

The exact-approved current digest completed the entire Minimal Responsible arm at 234,099 Operational Tokens. All objective tests passed, cold recovery found all four exact revisions and all three slices, and no boundary violation was observed. The Temple Design turn then crossed its 100,000 stage ceiling. Total candidate usage was 335,914, leaving 101,815 attributable to the censored Temple attempt. No blind evaluator ran. The stopped artifact retained the completed arm but exposed that the active stage telemetry was not attached before the main runner threw.

## Representative comparison v5

- Protocol SHA-256: `4b6c78cfa4b367787eb79a1d555dcfa387d2048d656741f7611f64c48b5f64f6`
- Design Operational-Token hard stop: 150,000
- Build Operational-Token hard stop: 69,000 per slice
- Integration Operational-Token hard stop: 80,000
- Candidate Operational-Token hard stop: 650,000
- Evaluator Operational-Token hard stop: 100,000
- Combined Operational-Token hard stop: 750,000
- Wall-clock hard stop: 45 minutes
- Retry and fallback: disabled
- Status: generation disabled until exact approval

V5 uses fresh matched repositories and preserves the task, arm order, model routes, context treatment, network boundary, and objective tests. The Design ceiling is a bounded increase from the 101,815 censored v4 observation, not a completion forecast. The candidate ceiling is derived from 234,099 completed Minimal Responsible Tokens plus 101,815 observed Temple Design Tokens plus 287,000 in already-declared remaining Build and Integration ceilings, then rounded from 623,914 to 650,000. The runner now attaches partial stage telemetry before propagating a fail-closed error.

The exact-approved v5 attempt ran from `2026-09-03T16:11:17.073Z` to `2026-09-03T16:15:08.209Z` and stopped with zero retry and zero fallback. Minimal Responsible Design completed at 47,032 Operational Tokens. The orders-catalog Build retained 33,432 Tokens before the literal command-prefix policy rejected `git -C ../../orders status --short`, issued from a nested Provider-reported working directory. The run retained 125,681 candidate Operational Tokens in total. No arm completed; Temple and the blind evaluator did not start. Two sibling Build App Server processes were found briefly alive after the stop record and were terminated. V5 is stopped evidence and cannot be resumed or re-approved.

## Representative comparison v6

- Predecessor: representative v5 protocol `4b6c78cfa4b367787eb79a1d555dcfa387d2048d656741f7611f64c48b5f64f6`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v5
- Relative Git policy: resolve from Provider-reported cwd and require an exact fixture repository root
- Parallel stop policy: interrupt and await all sibling Build turns before recording the stopped run
- Protocol SHA-256: `35deeb5fb60f8f48e818ad6abad7d576d7de976d95159d7a1fbe8ef00baa67c7`
- Status: frozen and generation-disabled pending separate exact approval

V6 is a successor experiment, not a retry. It does not globally allow relative traversal and does not reuse the v5 lab or approval. The command-policy repair is limited to read-only `status`, `diff`, `rev-parse`, `log`, and `ls-tree` operations whose normalized target is exactly one of the five generated fixture repositories. The parallel repair ensures that the final stop record cannot be written while sibling model turns remain active.

The exact-approved v6 attempt ran from `2026-09-03T16:33:33.382Z` to `2026-09-03T16:38:17.662Z` and retained 103,555 candidate Operational Tokens with zero retry and zero fallback. Minimal Responsible Design completed at 53,617. Notifications then requested `git -C ../../../notifications status --short`; its normalized target was not an exact fixture repository root, so the Build wave stopped. Gateway and orders-catalog were interrupted as siblings. The final artifact contains all three Build observations, every App Server child exited, and all five Minimal Responsible repositories remained clean. No arm completed; Temple and the evaluator did not start.

## Representative comparison v7

- Predecessor: representative v6 protocol `35deeb5fb60f8f48e818ad6abad7d576d7de976d95159d7a1fbe8ef00baa67c7`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v6
- Build command guidance: no candidate Git inspection, no parent-directory paths, and cross-repository commands originate at the arm root
- Safety boundary: the v6 exact-target and settled-sibling policies remain active
- Protocol SHA-256: `ff06ec032d8bc6f452e307269d9e87774e4f4207d0449af70905fcc314786674`
- Status: frozen and generation-disabled pending separate exact approval

V7 treats the repeated Git status request as unnecessary candidate work: the coordinator already checks paths, diffs, revisions, and handoff state after each Build turn. Removing that responsibility from the candidate prompt reduces accidental path traversal without loosening the command policy. V7 is a new experiment on fresh matched repositories and cannot reuse the v6 approval.

The exact-approved v7 attempt ran from `2026-09-03T16:46:53.272Z` to `2026-09-03T16:51:55.025Z` and retained 107,085 candidate Operational Tokens with zero retry and zero fallback. Minimal Responsible Design completed at 55,565. Notifications then requested the allowlisted read-only command `rg --files coordinator`, but the command-working-directory guard interpreted its Provider-relative cwd against the runner process directory instead of the generated arm. Notifications stopped at 14,336; Gateway and orders-catalog were interrupted after 17,089 and 20,095 respectively. All App Server children exited and both arms' repositories remained clean. No arm completed; Temple and the evaluator did not start.

## Representative comparison v8

- Predecessor: representative v7 protocol `ff06ec032d8bc6f452e307269d9e87774e4f4207d0449af70905fcc314786674`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v7
- Working-directory policy: normalize absolute paths and `file://` paths directly; resolve Provider-relative cwd values from the exact generated arm root; reject other URI schemes and every normalized escape
- Regression coverage: allow a safe repository-relative command and reject relative, URI, and absolute escapes
- Protocol SHA-256: `3c179b15b37e5fad0a538ff12dc0f4ca5a3e3d7384b8542b394f22bdd42618da`
- Status: frozen and generation-disabled pending separate exact approval

V8 corrects the cwd normalization defect without adding a command prefix, allowing a parent-directory segment, or broadening the generated arm. It is a new controlled experiment on fresh matched repositories and cannot reuse the v7 approval.

V8 was superseded before approval or generation. The repair covered the final observed symptom but still did not prove that the production runner could complete its entire lifecycle before using account capacity.

## Representative comparison v9

- Predecessor: representative v8 protocol `3c179b15b37e5fad0a538ff12dc0f4ca5a3e3d7384b8542b394f22bdd42618da`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v8
- New gate: run the production orchestration with a deterministic generation-free Provider double before exact approval
- Gate coverage: both arms, ten candidate stages, two three-way Build waves, cold integration, blind evaluation, analysis, objective tests, and ten repository cleanliness checks
- Historical event regression: Provider-relative cwd, `file://`, display-wrapper versus structured action, exact relative Git target, escape, network command, and cross-turn isolation cases
- Protocol SHA-256: `662cd01c96381f53e4eff79659a0e9da6ddf85022ff4d5cb49d095ced18ae02b`
- Readiness result: pass with zero Operational Tokens, zero retry, zero fallback, and no model generation
- Status: frozen and generation-disabled pending separate exact approval

V9 turns harness readiness into a live preflight requirement instead of another advisory test. The source lab stays pristine; the full rehearsal runs in a disposable canonical temporary clone. A readiness result must match the exact protocol digest and state that no model generation occurred. See `representative-harness-readiness-v1-report.md`.

The exact-approved v9 attempt completed the full Minimal Responsible arm and Temple Design, then stopped fail-closed during the Temple Build wave. The retained event summary identifies an `unknown` CommandAction and a `/bin/zsh -lc` command display for the framework-required Context Capsule command; the same inner command passes the local v9 predicate, so the evidence supports a wrapper-shape mismatch without claiming unretained raw action content. V9 retained 313,151 candidate Operational Tokens, zero retry, zero fallback, settled sibling observations, and clean generated repositories. The evaluator did not start, so there is no arm comparison.

## Representative comparison v10

- Predecessor: representative v9 protocol `662cd01c96381f53e4eff79659a0e9da6ddf85022ff4d5cb49d095ced18ae02b`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v9
- Provider event policy: unwrap at most one exact single-quoted `/bin/zsh -lc` layer, then reapply every existing inner-command and path policy
- Readiness coverage: adds the schema-valid wrapped `unknown` Context Capsule CommandAction that stopped v9
- Protocol SHA-256: `16591db95bde29d6becd273ce6df3cd39569f016ebdd03c5fd2fb2c21d9253e0`
- Readiness result: all twelve checks pass with zero Operational Tokens and no model generation
- Status: frozen and generation-disabled pending separate exact approval

The exact-approved v10 attempt completed Minimal Responsible Design, then stopped fail-closed during the first parallel Build wave. The Provider reported the same temporary workspace through canonical `/private/tmp/...` cwd paths while the runner's frozen arm root used the equivalent `/tmp/...` path. The v10 string containment check treated that filesystem alias as an escape. The run retained 77,224 candidate Operational Tokens, zero retry, zero fallback, settled all sibling turns, and left all generated repositories clean. No arm completed and the evaluator did not start. See `representative-main-v10-stop-report.md`.

## Representative comparison v11

- Predecessor: representative v10 protocol `16591db95bde29d6becd273ce6df3cd39569f016ebdd03c5fd2fb2c21d9253e0`
- Resource envelope, task, models, efforts, context treatment, objective tests, retry policy, fallback policy, and network boundary: unchanged from v10
- Provider cwd policy: canonicalize existing arm, cwd, and Git-target paths before containment and exact-repository checks
- Safety property: equivalent filesystem aliases are accepted, while an in-arm symlink resolving outside the arm remains rejected
- Readiness coverage: adds the exact lexical-versus-canonical temporary-path event shape that stopped v10
- Protocol SHA-256: `d729c503d8e8a9d35e0eb6367fda51fa76dbf34e7db45a5ef0a0408166283040`
- Readiness result: all thirteen checks pass with zero Operational Tokens and no model generation
- Status: frozen and generation-disabled pending separate exact approval
