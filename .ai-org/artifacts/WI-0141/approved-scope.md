# WI-0141 approved scope

## Question

When correctness is held primary, does stage-aware Context Capsule routing change what an Agent reads after the initial package, and does that explain any observed Token or latency difference?

WI-0139 showed a smaller selected package without lower total execution cost. WI-0140 added privacy-bounded acquisition measurement and fixed the successor design, but intentionally performed no candidate generation. WI-0141 is the separate live run.

## Conditions

The run contains eight candidate turns in this frozen order:

1. `single-stage-aware-a`
2. `multi-legacy-expanded-a`
3. `single-legacy-expanded-a`
4. `multi-stage-aware-a`
5. `single-legacy-expanded-b`
6. `multi-stage-aware-b`
7. `single-stage-aware-b`
8. `multi-legacy-expanded-b`

Each turn uses a fresh disposable repository clone. The single-repository ceiling is 51,000 Operational Tokens per turn; the coordinator-led multi-repository ceiling is 80,000 per turn. The aggregate hard ceiling is 524,000 Operational Tokens and the program wall-clock ceiling is 4,800,000 milliseconds. These are safety stop limits derived in WI-0140, not usage forecasts or optimal budgets.

## Acceptance

- preparation, rehearsal, preflight, and local tests perform zero candidate generation;
- the live command remains blocked until an affirmative approval record exactly matches the frozen protocol digest, condition list, model, reasoning effort, limits, and account-impact policy;
- all eight turns request `gpt-5.6-terra` with `medium` reasoning, zero retries, and zero fallback;
- every completed condition is checked against typed canonical facts before efficiency is interpreted;
- acquisition reports keep `routed`, `permitted-fallback`, `off-route`, `unknown`, `control`, and `required-evidence` distinct;
- single-repository and multi-repository results are analyzed separately before any diagnostic aggregate;
- censored, stopped, missing, or incomplete evidence remains explicit and cannot become a positive efficiency claim;
- `.ai-org/artifacts/WI-0140/**` remains byte-identical to commit `25b846d`.

## Privacy boundary

The repository may retain normalized structured completions, numeric usage, elapsed time, item counts, and bounded repository-relative acquisition paths. It must not retain raw prompts, raw model responses, hidden reasoning, raw commands, raw command output, credentials, absolute paths, or disposable repository contents.

## Interpretation boundary

Two repetitions per condition are diagnostic evidence, not statistical proof. The result may support a bounded engineering decision about the tested fixtures. It cannot establish monetary savings, universal Temple superiority, or automatic model-routing authority.

## Exclusions

No retry, fallback, evaluator-model turn, external write, production action, merge, public release, or follow-on optimization is authorized by this Work Item.
