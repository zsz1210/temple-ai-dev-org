# WI-0136 context-recovery qualification v10 report

## Result

Context Capsule-first retrieval is qualified for the replacement main Temple-versus-minimal comparison.

The routed candidate recovered the complete objective state. The full-load candidate completed but returned one incorrect revision: it omitted the final `d` from the Notifications commit SHA. In this one matched pair, routed context also used fewer Operational Tokens, completed sooner, issued fewer commands, and returned substantially less tool output.

This is a directional qualification result, not proof that routed context will always be better and not yet a measurement of Temple versus a minimal responsible workflow.

## Frozen experiment

- Work Item: `WI-0136`
- Protocol SHA-256: `f1a3da3550d5751581a049e0e17085948517eea5caa8b40c63e744c495fef33f`
- Requested route: `gpt-5.6-terra`, medium reasoning, for both candidates
- Conditions: routed context first; full-load context second
- Started: `2026-09-03T14:35:32.396Z`
- Completed: `2026-09-03T14:42:08.099Z`
- Candidate attempts: 2 of 2 completed
- Operational Tokens: 128,039 combined
- Retry count: 0
- Fallback count: 0
- Credits purchase, automatic refill, and usage reset: not authorized
- Network and external actions: disabled

Both candidates used fresh read-only turns over matched copies of the same five repositories. Their service and Coordinator revisions, trees, task state, output schema, tool policy, and recovery target were frozen before generation. The only intended treatment difference was retrieval order:

- **Routed:** resolve the Work Item Context Capsule first and read only routed sources; use `TEMPLE.md` only as fallback.
- **Full-load:** read `TEMPLE.md` first, then resolve and follow the Context Capsule.

## Observed results

| Measure | Routed | Full-load | Routed difference |
| --- | ---: | ---: | ---: |
| Objective recovery | Pass | Fail | Routed recovered 4/4 exact revisions; full-load recovered 3/4 |
| Operational Tokens | 57,296 | 70,743 | −13,447 (−19.01%) |
| Turn time | 170.043 s | 225.288 s | −55.245 s (−24.52%) |
| Non-cached input Tokens | 52,639 | 64,156 | −11,517 (−17.95%) |
| Output Tokens | 4,657 | 6,587 | −1,930 (−29.30%) |
| Gross Tokens, including cached input | 1,024,720 | 1,716,055 | −691,335 (−40.29%) |
| Commands | 32 | 40 | −8 (−20.00%) |
| Reported tool-output bytes | 51,116 | 147,178 | −96,062 (−65.27%) |
| Time to first activity | 2.728 s | 3.328 s | −0.600 s |
| Explicit prompt bytes | 3,236 | 3,108 | +128 bytes |

Operational Tokens are the approved experiment budget dimension: non-cached input plus output. Gross Tokens retain cached input for observability and must not be interpreted as billed usage or price. The routed explicit prompt was slightly larger, while its retrieval and tool-output footprint was much smaller; the observed reduction therefore was not created by shortening the user prompt.

## Correctness finding

The routed completion returned the four expected service revisions exactly, named the governing `OrderPlaced/v2` contract, identified all three completed slices, retained the unresolved work, and proposed a bounded safe next action.

The full-load completion satisfied every checked field except one exact revision. It returned:

```text
expected: d5aca6c21f8aa11c0f82d96e376453dd21ba7b2d
actual:   d5aca6c21f8aa11c0f82d96e376453dd21ba7b2
```

The actual value is 39 characters rather than the required 40. This is a candidate recovery error, not an analyzer or formatting defect. The raw completion remains unchanged.

## What the result supports

1. The routed Context Capsule path is executable and recovered the complete frozen state.
2. It is suitable as the Temple arm's context-loading treatment in the replacement main comparison.
3. For this one pair, routed context was descriptively better on objective recovery, Operational Tokens, elapsed time, command count, and surfaced tool-output volume.
4. The full-load failure is consistent with the risk that more retrieved material and more repository interaction can increase recovery burden, but one stochastic pair does not establish that as a causal population effect.

## What the result does not support

- It is not the Temple-versus-minimal comparison.
- It does not prove a stable percentage saving across projects, tasks, models, or repeated runs.
- It does not authorize automatic model or reasoning-effort routing.
- It does not compare Terra with Sol or Luna.
- It does not convert Tokens into money or predict account billing.
- It does not establish equal-quality efficiency because the full-load candidate failed one objective field.

The Provider accepted the requested Terra medium routes, while the retained thread-level observation was `high` and effective per-turn reasoning effort was unavailable. The report therefore describes the requested route and does not claim that effective effort was independently verified.

## Decision and next experiment

Freeze the replacement main comparison with Context Capsule-first retrieval in the Temple arm. Keep the minimal-responsible arm fair: normal scope, ownership, Git, tests, review, handoffs, and integration controls, but without Temple's organization layer. Measure objective delivery correctness before comparing Tokens, elapsed time, recovery effort, and blind quality.

The replacement protocol needs a new digest and its own exact account approval. This v10 approval is consumed; it authorizes no rerun, fallback, main candidate generation, evaluator generation, release, or publication.

## Evidence

- `context-recovery-qualification-v10-protocol.json`
- `context-recovery-qualification-v10-approval.json`
- `context-recovery-qualification-v10-preflight.json`
- `context-recovery-qualification-v10-run.json`
- `context-recovery-qualification-v10-analysis.json`

The preserved run SHA-256 is `4a074d4796ca075a8347e6ecdd3894ff82664b63c31f279971ccb14936e3eb29`. The preserved analysis SHA-256 is `80b953d039726cf47804ded75841142418d9bb9a18ccf35c101f0674b03238d1`.
