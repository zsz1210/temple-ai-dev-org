# Context Capsule route-adherence evaluation

- Status: bounded WI-0141 live comparison complete; follow-up measurement repairs required
- Design Work Item: `WI-0140`
- Live Work Item: `WI-0141`
- Question: after receiving a smaller Context Capsule, does an Agent actually stay on the routed evidence path?
- Scope: isolated single-repository and coordinator-led multi-repository fixtures

## Why Temple measures acquisition separately

WI-0139 showed that a smaller initial source package did not automatically reduce total Token use or latency. WI-0140 therefore added a privacy-bounded acquisition observation: it records which repository-relative paths an Agent reads after routing without retaining prompts, responses, hidden reasoning, raw commands, command output, credentials, absolute paths, or disposable repositories.

Each safe observation is classified as:

| Classification | Meaning |
|---|---|
| `control` | The condition-local `CONTEXT_PACKAGE.json` |
| `required-evidence` | An allowlisted Git revision or clean-status probe |
| `routed` | A source selected by the frozen Context Capsule |
| `permitted-fallback` | The Capsule's declared fallback source |
| `off-route` | A safe repository path outside the route and fallback |
| `unknown` | No safe and unambiguous repository path can be derived |

Unknown and overflowed observations reduce coverage and cannot raise adherence. Failed commands are excluded. Output bytes are attributed only when one completed action has an unambiguous source.

## Live design

WI-0141 executed two repetitions of each strategy for each project shape, with the within-shape order reversed in repetition B. Every turn requested `gpt-5.6-terra` with `medium` reasoning and allowed no retry or fallback.

| Project shape | Strategies | Repetitions | Per-turn ceiling |
|---|---|---:|---:|
| Single repository | Legacy expanded and stage aware | 2 each | 51,000 Operational Tokens |
| Coordinator-led multi-repository | Legacy expanded and stage aware | 2 each | 80,000 Operational Tokens |

The aggregate ceiling was 524,000 Operational Tokens and the wall-clock ceiling was 80 minutes. The actual run completed in 6 minutes 39 seconds and used 197,367 Operational Tokens.

## Results

All eight candidates completed correctly.

| Shape | Selected source bytes | Mean Operational Tokens | Mean latency | Diagnostic outcome |
|---|---:|---:|---:|---|
| Single repository | `-63.79%` | `-32.51%` | `+4.45%` | Supported, with high repetition sensitivity |
| Coordinator multi-repository | `-65.51%` | `+74.90%` | `-11.81%` | Trade-off |

The aggregate stage-aware conditions had 0.87% more gross Provider input, 1.96% fewer cached input Tokens, 18.44% more Operational Tokens, and 5.57% lower latency. Cache variation materially affected the net Operational Token result, so the observed deltas cannot be attributed to routing strategy alone.

Among 31 classifiable context reads, no off-route read was observed. Each of the eight turns also retained one unknown read, so coverage was incomplete. The run therefore does not prove full route adherence.

## Decision boundary

The comparison supports keeping stage-aware Context Capsules as a correctness-preserving authority and context-selection mechanism. It does not support a universal Token-saving claim, a shared policy for single- and multi-repository work, or automatic routing authority.

No additional candidate turns should run with this harness. Before a larger comparison:

1. classify the repeated unknown control-read shape with a sanitized regression fixture;
2. report gross input, cached input, non-cached input, output, and Operational Tokens together;
3. isolate or explicitly balance cache state across comparison blocks;
4. score correctness, route adherence, and efficiency as separate hypotheses;
5. preserve an explicit `tradeoff` outcome instead of hiding opposing material deltas as neutral.

## Reproducing analysis without another model run

The retained observation is sealed. Recompute only the deterministic analysis and Markdown projection with:

```bash
node scripts/run-context-capsule-ablation.mjs analyze
```

`prepare`, `rehearse`, `preflight`, and `run` refuse to replace the sealed live evidence. No new Provider comparison is authorized by this document.

## Evidence

- [Detailed WI-0141 evaluation](../../.ai-org/artifacts/WI-0141/live-evaluation.md)
- [Generated effectiveness report](../../.ai-org/artifacts/WI-0141/effectiveness-report.md)
- [Context Capsule v2 effectiveness experiment](context-capsule-v2-ablation.md)
- [Context Capsule typed evaluator](context-capsule-typed-evaluator.md)
