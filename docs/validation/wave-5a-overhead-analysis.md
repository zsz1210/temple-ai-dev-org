# Wave 5A overhead analysis

- Status: **offline analysis passed; no efficiency claim**
- Source: retained `WI-0113` four-candidate result
- Analysis Work Item: `WI-0116`
- Provider generation in this analysis: **none**

## What the numbers say

| Measure | Observed value | Meaning |
| --- | ---: | --- |
| Gross Provider Tokens | 1,662,089 | Input plus output throughput reported by the Provider |
| Operational-budget Tokens | 153,481 | Non-cached input plus output, the experiment's stop metric |
| Cached-input ratio | 91.52% | Share of input Tokens reported as cached |
| Candidate latency | 472,441 ms | Sum of the four candidate turn durations |
| Total program time | 473,047 ms | End-to-end runner duration |
| Coordinator overhead | 606 ms / 0.13% | Program time not attributed to candidate turns |
| Retry / fallback | 0 / 0 | No hidden repeated attempt |

Gross throughput was 10.83 times the operational-budget metric because the two counters answer different questions. Neither is a verified bill or a count of consumed Pro-plan Credits.

The compatible-event-evolution Temple candidate was the largest individual contributor: 35.01% of operational Tokens and 42.22% of total program time. In the only pair where both arms passed objective quality, Temple used 22,471 more operational Tokens (+71.89%) and 118,330 ms more latency (+145.38%). The idempotent-command pair is excluded from resource comparison because the minimal candidate failed hidden acceptance.

## What the numbers do not say

One qualifying pair cannot establish a causal Temple penalty, a Temple benefit, statistical significance, or an automatic routing rule. The retained aggregate also cannot isolate whether instruction volume, Max reasoning, completion behavior, or observation cadence caused the difference. Those are hypotheses for new instrumentation, not findings.

OpenAI's current model guidance supports this boundary: evaluate representative work using quality, evidence, Tokens, latency, and cost, and compare reasoning levels instead of assuming the highest setting is best. Its reported internal prompt-efficiency results are directional examples, not Temple measurements. Wave 5B must validate any leaner protocol on Temple's own matched workload.

## Reproduce locally

```bash
node scripts/analyze-wave-5a-overhead.mjs \
  --input .ai-org/artifacts/WI-0113/experiment-result.json \
  --output /tmp/wave-5a-overhead-analysis.json

node scripts/validate-wave-5b-protocol.mjs \
  --input .ai-org/artifacts/WI-0116/wave-5b-protocol-fixture.json \
  --output /tmp/wave-5b-protocol-check.json
```

Both commands write exclusively: an existing output path is rejected rather than overwritten.

## Wave 5B evaluator boundary

The next evaluator must run in a fresh Provider context whose declared inputs are only arm-neutral packages and a frozen rubric. The input manifest is hashed; condition, usage, Token, latency, repository path, candidate revision, coordinator, sealed, and mapping fields are forbidden. The score artifact must bind the evaluator context and manifest digest, be signed and frozen, and only then may the coordinator unseal the mapping.

This is a verifiable context and input boundary, not an operating-system security sandbox. A same-task evaluator cannot satisfy it. Missing task identity, manifest evidence, or freeze-before-unseal ordering makes the comparison unqualified.

## Evidence

- Machine-readable analysis: `.ai-org/artifacts/WI-0116/wave-5a-overhead-analysis.json`
- Protocol fixture: `.ai-org/artifacts/WI-0116/wave-5b-protocol-fixture.json`
- Protocol preflight: `.ai-org/artifacts/WI-0116/wave-5b-protocol-check.json`
- [Official GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model)
