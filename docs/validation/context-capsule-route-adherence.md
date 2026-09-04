# Context Capsule route-adherence evaluation

- Status: implementation and generation-free rehearsal complete; live Provider run not yet approved or executed
- Work Item: `WI-0140`
- Question: after receiving a smaller Context Capsule, does an Agent actually stay on the routed evidence path?
- Scope: isolated single-repository and coordinator-led multi-repository fixtures

## Why the measurement changed

The WI-0139 run showed that a smaller initial source package did not automatically produce lower total Token use or latency. Stage-aware routing selected 63.79% to 65.51% fewer source bytes, while the completed multi-repository stage-aware turn used 6.38% more Operational Tokens and took 8.01% longer. Both single-repository turns reached the previous 40,000-Token ceiling before completing.

Initial package size therefore answers only **what Temple selected**, not **what the Agent acquired afterward**. WI-0140 adds a separate acquisition observation so the next comparison can distinguish route quality from Agent reading behavior.

## What is retained

For each successful command, the harness records only bounded metadata:

```json
{
  "repository_id": "coordinator",
  "path": "docs/product/idempotency.md",
  "access_kind": "read",
  "classification": "routed",
  "reported_output_bytes": 812
}
```

The classification is one of:

| Classification | Meaning |
|---|---|
| `control` | The condition-local `CONTEXT_PACKAGE.json` |
| `required-evidence` | An allowlisted Git revision or clean-status probe |
| `routed` | A source selected by the frozen Context Capsule |
| `permitted-fallback` | The Capsule's declared fallback source |
| `off-route` | A safe repository path outside the route and fallback |
| `unknown` | No safe and unambiguous repository path can be derived |

Failed commands are excluded from adherence. Unknown and overflowed observations reduce coverage and can never raise the adherence score. Output bytes are attributed only when a completed command contains one unambiguous action.

Raw commands, search text, command output, prompts, responses, hidden reasoning, credentials, absolute paths, and temporary repository roots are not retained.

## Successor comparison

The frozen design contains eight candidate turns: two repetitions of each strategy for each project shape. Repetition B reverses the within-shape strategy order used in repetition A.

| Project shape | Strategies | Repetitions | Per-turn ceiling |
|---|---|---:|---:|
| Single repository | Legacy expanded and stage aware | 2 each | 51,000 Operational Tokens |
| Coordinator-led multi-repository | Legacy expanded and stage aware | 2 each | 80,000 Operational Tokens |

The aggregate ceiling is 524,000 Operational Tokens and the wall-clock ceiling is 80 minutes. Every turn uses `gpt-5.6-terra` with requested `medium` reasoning, zero retry, and zero fallback.

The single-repository ceiling is derived from retained evidence rather than an expected-cost guess: the highest censored WI-0139 observation was 40,460 Operational Tokens; one declared 10,000-Token headroom band and rounding to the next 1,000 produce 51,000. The multi-repository ceiling retains the prior non-censoring value. These are stop limits, not usage forecasts or optimal budgets.

## How results will be interpreted

Correctness remains the first gate. Token, latency, and route-adherence comparisons are not treated as positive outcomes unless both repetitions of both strategies complete correctly for that project shape.

The report keeps these measurements separate:

- selected source count and bytes;
- observed routed, fallback, off-route, and unknown reads;
- known route-adherence percentage and measurement coverage;
- Operational Tokens and latency;
- tool-output bytes where attribution is unambiguous.

Two repetitions reduce obvious order dependence but remain diagnostic evidence. They do not prove statistical significance, monetary savings, universal model behavior, or automatic routing authority.

## Generation-free verification

Run the preparation in a disposable system-temporary directory:

```bash
lab_root="$(node -e 'console.log(require("node:os").tmpdir())')/temple-wi0140-context-capsule-ablation"

node scripts/run-context-capsule-ablation.mjs prepare --lab-root "$lab_root"
node scripts/run-context-capsule-ablation.mjs rehearse --lab-root "$lab_root"
node scripts/run-context-capsule-ablation.mjs preflight --lab-root "$lab_root"
```

Before a matching approval record exists, preflight stops with `exact-approval`. Preparation, rehearsal, and preflight perform no candidate generation. The runner also rechecks that the retained WI-0139 artifact subtree still matches commit `1461cf6` before allowing a live run.

The live command is intentionally not authorized by this document. A new approval must bind the exact protocol digest, eight condition IDs, model, reasoning effort, per-condition limits, aggregate limit, wall-clock limit, and zero-retry/fallback policy.

## Related evidence

- [Context Capsule v2 effectiveness experiment](context-capsule-v2-ablation.md)
- [Context Capsule typed evaluator](context-capsule-typed-evaluator.md)
- `.ai-org/artifacts/WI-0139/live-evaluation.md`
- `.ai-org/artifacts/WI-0140/technical-design.md`

