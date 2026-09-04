# WI-0136 context/model diagnostic v5 stopped-run report

## Outcome

The exact-approved v5 diagnostic ran all four declared conditions once and stopped fail-closed. It produced useful partial evidence but did not produce a complete context or model comparison.

- Protocol SHA-256: `9c947a32b2e63f771de3bcdfae2f3e95dd8ab69b66a65e812473c28ec04d615f`
- Started: `2026-09-03T13:14:04.701Z`
- Stopped: `2026-09-03T13:25:45.002Z`
- Elapsed: 700,301 ms
- Operational Tokens observed: 233,753 of the approved 360,000 ceiling
- Retry count: 0
- Fallback count: 0
- Result evidence SHA-256: `0d7e67675b6c9e3c19ccf60a76780eef670c8eca872949d7bcb77914c2b27de0`

## Condition results

| Condition | Requested route | Status | Operational Tokens | Turn time | What was observed |
| --- | --- | --- | ---: | ---: | --- |
| `terra-routed` | Terra medium | Completed | 53,823 | 120,367 ms | Routed-context sequence observed; all four service revisions, the governing contract, unresolved work, and a bounded next action were returned. |
| `sol-routed-medium` | Sol medium | Censored | 80,156 | 237,993 ms | The condition crossed its 80,000-Token ceiling before structured completion. |
| `sol-routed-xhigh` | Sol xhigh | Censored | 80,156 | 334,843 ms | The condition crossed its 80,000-Token ceiling before structured completion. |
| `terra-full-load` | Terra medium | Stopped | 19,618 | 6,351 ms | The candidate attempted a chained shell command using `&&`; the frozen one-command policy rejected it before the required `TEMPLE.md` read could be observed. |

Gross Token totals include cached input and are retained in the JSON evidence. Operational Tokens are the approved budget dimension and equal non-cached input plus output.

## What the evidence supports

The Terra routed candidate completed within its ceiling and recovered all four exact service revisions. It used 53,823 Operational Tokens and completed in about 120.4 seconds.

Both Sol routed candidates required at least 80,156 Operational Tokens and did not complete within the approved ceiling. Relative to the completed Terra routed observation, Sol medium had a lower-bound increase of 26,333 Operational Tokens (48.93%) and took 117,626 ms longer (97.72%). This is censored evidence, not an exact completed-candidate quality or efficiency comparison.

At the same 80,156-Token stopping point, requested Sol xhigh took 96,850 ms longer than requested Sol medium (40.69%) and emitted 2,251 more output Tokens (55.91%), but neither produced a structured completion. The Provider accepted the requested turn efforts, while the retained thread-level field was `high` for both and the effective turn effort was unavailable. The evidence therefore describes requested routes only and does not prove the effective effort difference.

The higher 120,000 full-load ceiling was not reached. Full-load stopped on command policy at 19,618 Operational Tokens, so v5 provides no valid full-load-versus-routed context delta.

## Evaluation defect discovered

The Terra routed completion named all three required slice IDs, but appended handoff descriptions to each string. The output schema allowed arbitrary strings, while the deterministic recovery check counted only exact string equality. It therefore recorded `completed_slice_count: 0` and `recovery.pass: false` even though a post-run containment inspection found `orders-catalog`, `notifications`, and `gateway` in the returned values.

That mismatch is a test-contract defect. The current automatic `recovery.pass: false` must not be interpreted as proof that the Terra candidate failed the recovery task. The retained output also must not be retroactively rewritten into a pass.

## Failure classification

1. **Candidate instruction-following failure:** Terra full-load used a control operator explicitly prohibited by the frozen command policy. The policy worked as designed and should not be relaxed for the comparison.
2. **Insufficient Sol observation ceiling:** both Sol routes reached the same 80,000 ceiling without completion. V5 cannot compare their completed quality.
3. **Schema/evaluator inconsistency:** `completed_slices` was structurally loose while the evaluator expected exact IDs.
4. **Misleading top-level reason:** the run-level reason reported `context-strategy-not-observed`, while the retained stopped condition contains the earlier causal reason, `command-policy-violation`. Future reporting should preserve the causal stop first.
5. **Effort observability limit:** requested reasoning effort is known, but effective turn effort is not returned by the inspected Provider contract.

## Claims that remain unavailable

V5 does not establish:

- an exact Token, latency, or quality delta between full-load and routed context;
- an exact completed-candidate comparison between Terra and Sol;
- a completed-candidate comparison between Sol medium and Sol xhigh;
- a general model-routing rule;
- Temple effectiveness versus the minimal responsible workflow;
- statistical generalization, price, or savings.

## Recommended correction

Before another generation attempt:

1. constrain `completed_slices` to the exact three enumerated slice IDs and test the schema and evaluator together;
2. preserve the earliest causal condition stop reason before checking whether the intended context sequence completed;
3. keep the one-command shell policy unchanged;
4. treat effective reasoning effort as unavailable unless the Provider exposes a turn-level acknowledgement;
5. freeze a new protocol that explicitly decides whether to retain v5 Terra routed as an exploratory anchor or rerun a complete matched matrix;
6. if Sol is run again, use a newly approved evidence-labeled ceiling rather than presenting 80,000 as sufficient.

No retry, fallback, routing-policy change, main comparison, release, or publication is authorized by this stopped run.
