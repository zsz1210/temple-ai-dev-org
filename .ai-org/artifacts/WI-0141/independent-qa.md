# WI-0141 independent QA

## Verdict

Pass the bounded WI-0141 experiment to the Release Manager. This verdict accepts the integrity and usefulness of the retained diagnostic evidence; it does not approve universal Token-saving claims, automatic routing, another Provider run, or external release.

Independent QA was performed as `agent-lulu`, distinct from Developer `agent-rikku`.

## Acceptance review

| Requirement | Result |
|---|---|
| Exact protocol, model, order, limits, privacy boundary, and zero retry/fallback were bound before generation | Pass |
| Live generation required a matching affirmative approval | Pass |
| Correctness, route acquisition, Tokens, latency, and repository shapes are reported separately | Pass |
| Partial and unstable evidence is labelled without statistical, monetary, or routing-authority claims | Pass |
| WI-0140 artifacts remain byte-identical to their accepted revision | Pass |

## Reproduction

- focused Context Capsule tests: 9 passed, 0 failed;
- protocol, observation, and analysis digest agreement: passed;
- eight unique conditions in frozen order: passed;
- completed/correct candidates: 8/8 and 8/8;
- retained total recomputation: 197,367 Operational Tokens;
- retry/fallback recomputation: 0/0;
- raw-retention flags: all prohibited categories remain false;
- WI-0140 diff from `25b846dd3f2756fe813e44cbe026adfc2d2eb258`: none;
- Temple Doctor: 36 pass, 1 warning, 0 fail.

The Doctor warning says the generated parallel plan is stale. WI-0141 dispatch is already complete, no parallel dispatch is authorized, and the warning does not weaken this candidate.

## Evidence limits confirmed

- Every classifiable read adhered to the route, but eight unknown reads make route coverage incomplete.
- Single-repository mean Operational Tokens decreased by 32.51%, but its stage-aware repetitions had a 154.32% spread relative to their minimum.
- Multi-repository mean Operational Tokens increased by 74.90% while latency decreased by 11.81%; `tradeoff` is the correct label.
- Aggregate gross input differed by only 0.87%, while cached input and net Operational Tokens moved differently. Cache sensitivity prevents a routing-only causal claim.
- Two repetitions per condition remain diagnostic, not statistical evidence.

## Release recommendation

Close WI-0141 as an accepted bounded experiment with no external release. Preserve the live observation and record the five measurement repairs in the release record. Do not run another candidate comparison until the unknown acquisition record and cache-control design are repaired in a separately authorized Work Item.
