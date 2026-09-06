# Single versus parallel Terra POC: results and recommendations

## Decision

Do not make fine-grained parallelism the default for small tasks on this evidence.

The single-worker arm delivered a correct sales-report generator and received fresh Verifier acceptance. All three parallel workers delivered their modules, but the Integrator was interrupted by the experiment command policy before completing its handoff. The final parallel Verifier did not start. This is an **incomplete comparison**, not a parallel delivery failure or a complete efficiency win/loss.

Even before integration, the three workers used 146,253 Operational Tokens versus the single Builder's 69,525. The longest worker took 194.695 seconds versus 210.985 seconds for the single Builder: only 16.290 seconds less actor-phase waiting, before join, integration and verification. That is a useful warning about decomposition overhead, not a causal estimate across projects.

## What was tested

The same dependency-free JSON sales-report contract was given to every subject. A single Builder owned validation, summary and rendering. The parallel arm used three isolated module workers, deterministic exact-revision joining, a fresh Integrator and a fresh Verifier. All six actors that started requested Terra medium; model acknowledgements matched and thread effort was observed as medium. Effective turn effort was not separately reported.

This isolates a fixed topology choice under one model. It does **not** compare GPT-6 against Terra, measure a strong-model planner against a cheap-worker pool, test automatic task decomposition, or establish Temple-versus-ordinary effectiveness. Neither subject arm was loaded with Temple.

The frozen [protocol](protocol.frozen.json), [contract](product-contract.md), [readiness](readiness.md) and sanitized [results](results.json) are retained. The executable source revision is recorded in results.json. Private lab paths, account identity, raw commands and hidden reasoning are not included.

## Results

| Measure | Single-worker arm | Parallel arm |
| --- | ---: | ---: |
| Delivery status | Fresh Verifier accepted | Integrator interrupted; final Verifier not started |
| Operational Tokens | 106,735 complete | 195,397 partial |
| End-to-end time | 328.535 s, about 5 min 29 s | No completed end-to-end measurement |
| Product correctness | Public tests and frozen held-out checks passed | Joined product passed the same checks in a post-stop diagnostic |
| Final independent subject verification | Completed | Not performed |

The parallel partial Token sum already exceeds the single arm's complete sum by 83.1%, but it must not be represented as a completed comparable total. Its elapsed partial interval is censored by interruption; no speed ranking is justified.

| Actor | Elapsed seconds | Operational Tokens | Result |
| --- | ---: | ---: | --- |
| Single Builder | 210.985 | 69,525 | Delivered |
| Single Verifier | 117.329 | 37,210 | Accepted |
| Validation worker | 194.695 | 46,662 | Delivered |
| Summary worker | 162.340 | 66,836 | Delivered |
| Rendering worker | 102.957 | 32,755 | Delivered |
| Parallel Integrator | 85.901 | 49,144 | Interrupted |
| Parallel Verifier | Not started | Unknown; no actor turn | Not performed |

All three workers overlapped for 102.957 seconds. The coordinator joined their disjoint committed files in 93 ms, with zero file conflicts. Genuine concurrent execution occurred, but concurrency alone did not establish an accepted delivery speedup.

There were five completed actor stages, one interrupted stage and one unstarted stage. The matrix stopped after 609.495 seconds with 302,132 last-observed Operational Tokens. Neither the 600,000-Token nor 45-minute ceiling was reached. There were no actor retries, fallbacks, resets, purchases or refills.

## Why it stopped

The Integrator's next command was classified as `git-log` with `unsupported-option`. The runner requested an interrupt, received acknowledgement and observed an interrupted terminal. It did not reach final completion, write its handoff or start the next Verifier.

This is an experiment-harness compatibility problem, not evidence that Terra could not integrate the modules. The prompt broadly allowed Git log, while the semantic command policy recognized only a narrower option grammar. The retained event proves the command family and rejection reason; the exact option was not retained, so we cannot honestly identify it.

A separate, generation-free diagnostic reproduced the policy inconsistency:

- `git log -n 1 --oneline` is accepted.
- `git log -1 --oneline` is rejected as `unsupported-option`.

This example is **not a claim that the actor issued the second command**. It establishes that a normal read-only spelling can trigger the observed class of failure. Do not solve this by permitting arbitrary shell commands or silently resuming a sealed run.

Post-stop checks ran without a model in the same command sandbox. Both public tests and the frozen held-out oracle passed on the joined product. These checks help localize the failure; they do not substitute for the missing fresh Verifier or retroactively complete the arm.

## What the data suggests

1. **The task was probably too small for three independent workers plus integration.** Three worker turns used 2.10 times the Builder's Operational Tokens while reducing the longest implementation interval by only 16.29 seconds. The extra Integrator had already used another 49,144 Tokens before interruption.
2. **Repeated sessions and handoff inspection are substantial work.** Workers issued 46 commands in total versus the single Builder's 16; the Integrator started 16 more. These operation counts support investigating repeated setup and inspection. They do not measure the causal Token contribution of each action.
3. **Good contracts did enable clean joining.** The disjoint implementations joined without conflicts and passed the frozen objective checks. This is bounded evidence that the chosen interfaces and ownership worked.
4. **Safety instrumentation itself needs usability testing.** Six preparation tests and 630 repository tests passed, yet the live Integrator hit an unsupported option. A separate diagnostic proved that a normal read-only spelling can trigger the same rejection class; the actual rejected spelling remains unknown. More tests in the abstract are not the answer; tests must target the prompt-policy mismatch and real supported command variants.

## Recommended improvements before another live comparison

### First: repair the experiment tool, without consuming another model run

- Generate the actor command guide and policy checks from the same supported grammar; include accepted forms and common equivalent read-only Git spellings.
- Add replay regressions for these exact read-only variants, integration with an already-correct candidate, and no-change handoff. An Integrator must not need an artificial code change or commit merely to demonstrate work.
- Retain sanitized unsupported option names and command family, without paths, arguments containing secrets or raw command text. Current HMAC-only command evidence is insufficient for exact diagnosis.
- Checkpoint per-stage usage/progress while a turn is running. The current artifact is updated at stage boundaries; a process crash could otherwise lose the latest observation.
- Preserve this protocol, source revision and stopped result. Any corrected execution is a separately bound run, never a continuation disguised as the same sample.

### Second: use a decomposition gate, not a fixed worker count

- Default to one Builder for small, tightly related modules such as this POC.
- Consider parallel workers when independent work is large enough that saved critical-path time can plausibly exceed dispatch, duplicated reading, integration and verification.
- Do not invent a universal Token threshold from this single pair. Record task shape, ownership, dependency density, contract stability, observed setup/join time and accepted outcome quality.
- Keep the fresh verifier requirement comparable between arms. Do not improve the apparent parallel result merely by dropping its quality checks.

### Third: only then test the original strong-planner/cheaper-workers hypothesis

Use a larger but bounded task with genuinely independent substantial pieces. First complete a same-model topology comparison; then separately vary planner/worker models. Include planner, worker, integration and verification costs, with randomized order or repeated matched samples and documented cache conditions. No additional run or framework policy promotion is authorized by this report.

## Accounting and limits

Operational Tokens = input Tokens minus cached input Tokens plus output Tokens.

| Observed usage | Single complete | Parallel partial |
| --- | ---: | ---: |
| Input Tokens | 857,568 | 1,562,252 |
| Cached input Tokens | 760,064 | 1,382,400 |
| Output Tokens | 9,231 | 15,545 |
| Total input + output | 866,799 | 1,577,797 |
| Operational Tokens | 106,735 | 195,397 |

These counters are last-observed Provider usage, not guaranteed billing-final usage or currency. Cached Tokens are not claimed to be free. No monetary saving can be calculated from these counters alone.

There is one pair, fixed single-first order, uncontrolled cache and no control of all background host/provider load. The parent conversation's planning/inference Tokens were not attributed. Full one-off harness preparation was not timed end-to-end and is unknown, not zero; the complete local repository test execution itself took 150.161 seconds. Preparation and parent inference must be included or amortized explicitly in a future total-cost study.

Formal Standard Work Item Independent QA has not been completed by this report. The experiment's fresh single Verifier is a subject in the comparison, not approval of the outer harness or a release.
