# Wave 5 controlled comparison plan

- Status: **designed / model execution not approved**
- Work Item: `WI-0106`
- Evidence class: current official documentation, retained local telemetry, deterministic study design
- Model generation in this Work Item: **none**

## What Wave 5 must answer

Temple needs a fair comparison, not a demonstration in which the framework receives a better task or the baseline is deprived of normal engineering safeguards.

Wave 5 therefore separates two experiments:

1. **Temple versus a minimal responsible workflow**, using the same model and product cases. This measures the process intervention.
2. **Luna Max versus Terra Medium inside Temple**, using one exact task shape. This measures a model-profile intervention.

The results cannot be pooled. Sol XHigh planning, multi-agent parallelism, and enterprise collaboration require later task shapes and are not silently generalized from this first implementation pilot.

## First execution slice

Wave 5A is a four-turn feasibility pilot: two synthetic Node.js engineering cases, each run once with Temple and once with a minimal workflow. All turns use GPT-5.6 Luna with Max reasoning, sequentially, with identical product sources, acceptance tests, tools, local sandbox, network prohibition, and zero retry.

The treatment difference is recorded explicitly. Both arms retain product requirements, tests, safety boundaries, exact revisions, and independent evaluation. The minimal arm is credible engineering practice, not a deliberately poor control.

## Pass conditions

Wave 5A passes as an experiment mechanism only if:

- all four turns acknowledge the requested model and preserve exact task correlation;
- detailed Token fields are retained from Provider events at the Git-common-directory boundary;
- condition packages can be graded without revealing their labels;
- every candidate has an exact revision, clean state, bounded changed paths, and complete test record;
- ceilings, zero retry, and stop behavior work as declared.

A mechanism pass does **not** mean Temple won. With two cases, outcome differences are descriptive and cannot support a causal savings or superiority claim.

## Why the run is not automatic

The retained account probe confirmed that account usage is readable but unallocated. It cannot reserve a per-experiment budget. OpenAI documents that Pro included usage is consumed first and purchased Credits may be used after the included limit; automatic reload can also purchase Credits when enabled. A strict no-new-payment run therefore needs the owner to confirm the account setting before launch.

The proposed hard envelope is four sequential Luna Max turns, 80,000 total Tokens per turn, 320,000 aggregate Tokens, zero retries, 10 minutes per turn, 60 minutes overall, 128 MiB growth per repository, and 512 MiB aggregate growth. Token interruption is reactive and may overshoot; it is not a billing guarantee. The public token-rate conversion is retained only as planning evidence because exact applicability to this personal Pro account was not confirmed.

## Evidence basis

- [`WI-0067` stopped-run evidence](bounded-four-repository-commerce-rehearsal.md): two Luna Max attempts reported 148,648 total Tokens and stopped without retry or product changes.
- [Official Codex plan usage guidance](https://help.openai.com/en/articles/11369540-codex-and-chatgpt-plan-usage-limits): task consumption varies with model, complexity, and context; the usage page is the account authority.
- [Official flexible Credits guidance](https://help.openai.com/en/articles/12642688): included usage is consumed first; purchased Credits extend use after limits, subject to account availability and settings.
- [Official GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model): compare representative tasks using success, completeness, evidence, Tokens, latency, and cost instead of assuming maximum effort is always best.

## Next decision

Approve or revise the Wave 5A cases, four-turn Luna Max envelope, and no-new-payment account condition. Only then may a separate execution Work Item build the fixtures and launch the model-backed pilot.
