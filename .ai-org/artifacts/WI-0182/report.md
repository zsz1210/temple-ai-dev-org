# WI-0182 v7 measured comparison

The fresh requested matrix completed **8/8 actor stages**. All final products, held-out oracle checks, exact-candidate handoffs and fresh Verifier outcomes passed. Both Temple pairs also passed observed treatment checks: compact Context, composed Builder delivery, and successful persisted compact Status plus compact Doctor after the final lifecycle mutation. Neither model showed an efficiency advantage for Temple in this bounded task.

| Requested and acknowledged model | Effort | Ordinary operational Tokens | Temple operational Tokens | Temple difference | Ordinary stage time | Temple stage time | Temple difference |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| gpt-5.6-terra | medium | 69,410 | 101,062 | +45.60% | 226.262 s | 291.537 s | +28.85% |
| gpt-6-astra | medium | 44,145 | 112,607 | +155.08% | 224.897 s | 324.163 s | +44.14% |

Each row combines one Builder and one fresh Verifier per arm. Operational Tokens are non-cached input plus output, not gross Tokens or account-final billing. Including cached input, total Tokens were 630,306 versus 1,264,326 for Terra, and 479,985 versus 1,337,951 for GPT-6. Requested and acknowledged model IDs match; observed thread effort was medium for all eight stages. Effective turn effort and immutable model release revision remain unobserved. The installed provider was codex-cli 0.153.1 on Node v24.20.0.

## Execution and retained evidence

- Source candidate: `648a6b2c66df6215d40d3a6c1e19a207a1cdfe53`; behavior digest `sha256:636be2aa04060ef05fd6507062d25eaf88661ceadc73d768e80632920f63ccb0`. Later commits add governance/evidence only.
- Process: delivery-process/v7, digest `sha256:f41225f9fd3aeea9612c8c40b625ce8357f1c9f583c1e29e2156975cf3bd4b09`.
- Frozen matrix: `sha256:ed7fe27f4f577b4c124fcc282ed16fbfd205346d57edbf5fe652d68e48c07053`; see matrix.frozen.json and fresh approval.json/approval.md.
- Observed actor usage: **327,224 operational Tokens** of the 640,000 maximum. Matrix elapsed time: **1,069.158 seconds**. Exactly eight actor turns; no added actor retry, fallback, purchase, refill or reset. In-turn test/edit iterations occurred and are included in the totals; final acceptance does not mean every intermediate test invocation passed.
- `analyze.mjs` rereads both original runs, verifies run and artifact seals, reconciles approval/protocol/source bindings, recalculates operation statistics and Token counters, and cross-checks per-arm stage totals against pair and matrix aggregates. Separate Python arithmetic reconstruction from the stage counters matched all displayed totals and percentages. No additional model was called for reconciliation.
- Corrected full local verification: 571/571 passed; installed-provider no-model rehearsal: four synthetic stages and two denied boundary writes. Distinct-Identity Independent QA passed corrected **readiness**, with 54/54 independent focused checks. It is not claimed as a separate live-result review. The first rejected readiness finding and its corrected cycle are preserved.

The raw lab locator is kept under the shared Git metadata, outside publication artifacts. Protocols, consumed locks and sealed labs are not modified. Results are retained in results.json; no raw prompts, hidden reasoning, provider session IDs or account identifiers are published here.

## What the result supports

GPT-6's Temple Builder completed at 69,805 operational Tokens this time, under the 80,000 cap, with both required compact diagnostics observed. That is a completed outcome, unlike the stopped WI-0179 stage. It does not isolate which change prevented the previous interruption.

Compact diagnostic output is small: each Temple stage returned about 1,741–1,744 Status bytes and 313–316 Doctor bytes. Yet overall operational Tokens and stage time remained higher than ordinary delivery for both models. Output slimming alone has not demonstrated a total efficiency win here.

File-read payload is a plausible next investigation: observed `cat` output totaled 74,288 Temple versus 11,072 ordinary bytes for Terra, and 94,414 versus 13,049 for GPT-6. These include framework, product, test and evidence reads; they are not per-operation Token attribution and cannot establish the fraction of overhead caused by any file.

## Limits and completion

This is one pair per model, not a ten-session reliability study or within-model counterbalanced sample. Terra ran ordinary-first and GPT-6 Temple-first. Cache behavior is uncontrolled. The retained fixed protocol requires Temple's cold entry reads of AGENTS.md and TEMPLE.md; results apply to this protocol, not every possible routed workflow. Historical v5/v6 runs are context rather than causal controls. Coordinator/reviewer usage and harness development time are excluded from the actor table; stage wall time includes tools and provider latency.

The small feature had a clear shared contract and both ordinary deliveries succeeded. This run supports the conclusion that Temple added cost without an observed acceptance benefit for this task. It does not settle benefits for requirement changes, recovery, coordination or risk-heavy tasks, and it does not justify a model ranking or global efficiency claim.

The requested comparison is complete. Stop at this matrix and retain its result; no further model trial, framework improvement, merge or release is implied.
