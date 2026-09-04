# WI-0142 measurement repair result

## Outcome

The successor analyzer now recognizes exact, privacy-safe single-file control-package reads for future observations and keeps ambiguous forms unknown. It also makes cache-control validity a separate result from diagnostic Token and latency deltas.

The sealed WI-0141 observation and report were not changed. Its eight historical unknown records remain unknown because the raw action commands were intentionally not retained; the new classification is proven only against sanitized regression fixtures.

## Deterministic projection of retained WI-0141 data

The v5 analyzer reads the retained protocol and observation without making a model call:

| Shape | Diagnostic outcome | Non-cached input delta | Largest paired cache-share difference | Causal efficiency |
|---|---|---:|---:|---|
| Single repository | supported | -33.43% | 11.42 percentage points | blocked |
| Coordinator multi-repository | tradeoff | +79.79% | 14.86 percentage points | blocked |

Across both shapes, stage-aware conditions had 0.87% more gross input, 1.96% fewer cached-input Tokens, 19.68% more non-cached input, 9.69% fewer output Tokens, 18.44% more Operational Tokens, and 5.57% lower latency.

The causal result is blocked with reason `protocol-cache-control-not-declared`. This is independent of whether a diagnostic mean looks favorable. The historical result remains useful for finding the cache-control weakness, but it cannot establish a routing-only efficiency effect.

## Reusable successor method

The new guide and draft protocol template retain the experiment structure for later use. A future workflow or model evaluation must select one causal factor, derive sample size and limits from pilot evidence, predeclare cache control, freeze the protocol digest, and obtain exact approval. The template starts with model generation and every external authority disabled.

