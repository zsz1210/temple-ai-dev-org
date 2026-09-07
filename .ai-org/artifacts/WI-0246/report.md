# Reading-scope experiment: no demonstrated efficiency improvement

## Decision

The approved run stopped after one completed stable-scope subject. It used
**92,874 Operational Tokens and 476.431 seconds** and failed the original
delivery-scope screen. The changed-spec subject did not run. **Do not promote
the reading-policy clarification as an efficiency improvement or launch another
prompt-wording experiment from this result.** The two-condition study is
inconclusive; the observed stable result provides no positive efficiency signal.

This is the actual experiment report, not preparation. [Numeric evidence](comparison.json)
preserves the original sealed outcome. The source clarification may remain a
separately reviewable semantic correction, but its cost benefit is unproven.

## What changed and what was measured

One existing compact Context `read_policy` string now distinguishes a CLI
freshness inventory from an Agent reading checklist. All source references,
authority checks, instructions, claims, candidate checks and gates remain. The
string grows by 250 bytes. No actor prompt, model, Skill, Position, solution or
workflow step was added or removed. See [design](../WI-0245/design.md).

Terra medium performed a fresh Developer takeover of the retained quote/shipping
task. Only Developer work through its handoff was measured, not downstream
Verifier/QA, coordinator preparation or report writing. Scope and oracle facts
were reused; old completed solutions were not. Historical observations are not
concurrent controls, and cache/service conditions were not controlled.

## Results by condition

| Condition | Execution | Original acceptance | Separate product check | Operational Tokens | Attempt time |
| --- | --- | --- | --- | ---: | ---: |
| Stable | Completed with final usage and confirmed cleanup | Rejected: `delivery-source-drift` | Post-hoc isolated 46 cases and regressions passed | 92,874 | 476.431 s |
| Changed specification | Not run after shared stop | Unmeasured | Unmeasured | — | — |

The batch consumed 92,874 observed Operational Tokens and took 476.935 seconds.
There was one invocation, no retry/replacement/fallback/reset/purchase and no
extra model judge. The first actor finished before its 100,000 Token/eight-minute
ceiling. The stop was a validity/scope rejection, not exhausted allowance or time.

## Why the delivery screen rejected it

The actor committed the tested product as
`42177d33755a8c841cedce9533747d9f32e7cc03`, then committed delivery records as
`4e6aa0f2aac6d7644ff9422552868701dc82d0cf`. Product/test files are identical between
these commits. Claim, exact candidate, handoff, finish receipt and Test entry were
recorded, with a released Developer claim.

However, the actor also created two normalized evidence entries, one Git revision
and one Test, modifying `.ai-org/project/evidence.json`. That registry is not in
the frozen `deliveryRecords` allowlist. It is the sole unallowed path in the
candidate-to-delivery diff, causing `delivery-source-drift` before product cases.
The error label therefore does **not** mean the product implementation drifted.

The final finish request cites the local test-observation artifact, not either
normalized Evidence ID. Normalized registration is supported by Temple but not
required for this bounded local-artifact Lean route. The event stream confirms
two extra evidence registrations in addition to claim/handoff/release/transition.
It does not quantify their individual Token cost or the reason the model chose them.

This reveals both optional administration and a contract-alignment problem:
the generic framework exposes a valid registration operation, while this bounded
experiment rejects its resulting registry mutation. Do not silently broaden the
oracle, label this a product-quality failure, or call it a newly discovered core
framework prohibition. WI-0239 had already surfaced optional evidence registration;
this run shows the reading-only intervention did not address that retained issue.

For diagnosis only, a fresh disposable clone was checked out at the exact product
candidate. The existing assessor ran through the isolated command executor with
delivery-descendant acceptance disabled: all 46 product cases and regressions
passed. This tests product scope only; it does not accept the final delivery or
replace the original score. No model was generated, no frozen source/result was
edited, both seals still match, and diagnostic scratch was removed.

## Historical comparisons, not causal estimates

| Stable observation | Operational Tokens | Attempt time | Qualification |
| --- | ---: | ---: | --- |
| WI-0239 ordinary | 31,374 | 81.175 s | Originally accepted historical reference |
| WI-0242 compact Temple | 62,917 | 140.862 s | Original baseline-alias rejection; post-hoc product pass |
| WI-0246 reading-scope Temple | 92,874 | 476.431 s | Original registry-scope rejection; post-hoc product pass |

Versus WI-0242: **47.6% more Operational Tokens and 3.38 times the attempt time**.
Versus the recent ordinary reference: **2.96 times Tokens and 5.87 times time**.
These are descriptive cross-run arithmetic, not accepted-delivery speed ratios
or proof that the extra sentence caused the regression. Do not pool stopped
WI-0239 Temple usage or mix changed-spec rows into this stable comparison.

## What the observations explain—and do not

| Measurement | WI-0242 | WI-0246 |
| --- | ---: | ---: |
| Uncached input Tokens | 58,241 | 85,804 |
| Output Tokens (including reasoning) | 4,676 | 7,070 |
| Cached input Tokens | 462,848 | 587,008 |
| Completed command items | 14 | 20 |
| Observed command-output bytes | 100,487 | 78,912 |
| New normalized evidence registrations | 0 | 2 |

Observed command-output bytes fell **21.5%**, while command count and Operational
Tokens increased. Smaller tool output alone is therefore not sufficient evidence
of efficiency. These bytes are not total model input or a transcript of reads.
Uncached input is 92.4% of current Operational Tokens, but per-operation attribution
and the complete native context are unavailable.

The v3 diagnostic counters classify all sixteen unknown commands as
`non-literal-shell-body`, accounting for 70,179 observed output bytes. None lacked
a command field or hit the command-length/output/event limits. This narrows the
coverage issue to conservative parsing of shell bodies, not missing output data.
It does not reveal the inner commands or prove wasted reading, safe behavior,
repeated tests, or causation. Raw commands and outputs remain unretained.

## Next improvement decision

1. **Stop wording-only tuning.** This run does not support making this sentence
   the next efficiency strategy. Preserve the result rather than enlarging prompts.
2. **Align the bounded execution contract and evaluator offline.** Decide explicitly
   which records the local-artifact Lean route requires. Prefer one real test
   artifact plus generated finish/handoff; normalized registration remains optional
   for workflows that need it. Test both the minimal route and the optional
   registration route, with declared scope expectations, before another live batch.
   Never weaken product, revision, authority or distinct-verifier requirements.
3. **Move work selection into a precise existing-stage interface.** Separate required
   next actions from optional facilities so the Agent need not infer an administrative
   workflow from the full CLI catalog. This is a design proposal, not a new Position,
   installed Skill or validated efficiency gain. Do not add another learning loop
   or automatically promote the observation into a global rule.

The root hypothesis should now be action selection/contract alignment, not simply
handoff text length. A future live run needs a concrete changed action boundary
and qualified acceptance contract. There is no automatic next batch here.

## Provenance

- Behavioral candidate: `3bfae21d8b2cc39df325f025b0e02f4a2ab61669`.
- Execution evidence revision: `7b73c8fc`.
- Protocol: `sha256:2dd89072ebfead894a2eb614a6df2e72d3498faefc58c0197b32ba9f2c876df2`.
- Run: `sha256:2a189662c3726e49363c1921e522f8d6243cc52114cb3dce5c93178e8354d91f`.
- [Authorization](authorization.md), [source verification](../WI-0245/verification.md),
  [readiness QA](../WI-0245/independent-qa.md),
  [historical compact report](../WI-0242/report.md),
  [historical ordinary/censored report](../WI-0239/report.md).
