# Step 5: continuity and integration scenario design

Status: design only; no model execution authorized. WI-0208 step 4 stopped before any slim delivery, so this design is not based on a demonstrated efficiency win. Do not spend its unused allowance here or claim these scenarios compensate for a missing comparison.

## Question

Does repository-backed responsibility, current evidence and handoff state improve correct recovery when work spans fresh sessions, changing requirements or concurrent ownership? Measure correctness separately from cost and latency. A small pure-function delivery does not answer this question.

## Common comparison contract

Use ordinary Git plus sensible README/task/handoff notes as the baseline, not an intentionally undocumented repository. Temple and ordinary subjects receive the same requirements, decision history, candidate content, test access and interruption point. Only the representation and supported workflow differ. Do not give either actor earlier chat history, hidden oracle answers or another actor's reasoning. Start each recipient in a fresh context. Pin fixture, prompt, model, requested effort, instrument and source revisions. Keep cached/uncached input, output and wall time separate; no causal Token allocation from document byte counts.

Before live work, implement deterministic expected-state checks and synthetic traces for success, refusal, stale evidence, interruption and unknown provider events. Preserve safe structural failure diagnostics without retaining raw prompts or reasoning. A successful local suite is not model evidence. Fix WI-0208 diagnostic and archive-readiness gaps first. Prepare an explicit new finite run count, Token/time budget and order after that; this document grants none.

## Scenarios

| Scenario | Shared starting facts | Actor's task | Deterministic acceptance |
| --- | --- | --- | --- |
| Fresh-session handoff | Committed implementation, current passing tests, one documented unfinished acceptance criterion, previous actor stopped | Recover exact candidate and finish only the remaining criterion | Preserve completed behavior; resolve the named remainder; no duplicate implementation or unsupported completion claim; current candidate and verification agree |
| Approved requirement change | Version 1 passing evidence, explicitly approved version 2 requirement with one changed invariant, old result still available | Implement version 2 and reconcile what old evidence no longer supports | Version 2 oracle passes; unchanged invariants preserved; old evidence never asserted as proof for the changed candidate; new verification points to exact revision |
| Shared-contract conflict | Two local branches, explicit owners, shared interface proposal not yet approved, independent nonconflicting work available | Complete safe owned work and identify the integration boundary | Do not overwrite the other branch or change unapproved interface; record exact dependent revision and a concrete decision request; after separately supplied approval, integrate compatible candidates and test the join |

The third scenario initially simulates collaboration locally. It cannot establish distributed locking, multiple-human usability or enterprise readiness. Separate any later integration follow-up into a predefined stage with equal approval input for both arms. No surprise approval injection or post-hoc helpful hint.

## Measurements and decisions

- Primary: acceptance invariants, stale-evidence false acceptance, unauthorized overwrites, duplicate delivered work, exact candidate continuity and unresolved issues.
- Secondary: observed Operational Tokens, cached/noncached input, output, actor wall time, commands, reported output bytes, interventions and required decision questions. Necessary questions are not failures; unnecessary questions require an explicit oracle, not reviewer taste.
- Report every failed or stopped stage and its classification: product behavior, workflow adherence, instrument/provider incompatibility, budget or unknown. Never convert an interrupted attempt into a cheap successful delivery.
- Use repeated matched subjects and counterbalanced order in a separately approved protocol. Small diagnostic counts support examples and debugging, not significance or universal savings. Choose any statistical expansion from observed variance and a predeclared meaningful effect, not a convenient sample size.
- An improvement requires preserved acceptance first. If continuity improves at additional cost, report the tradeoff rather than calling it a Token optimization. A quality regression blocks broader adoption.

## Launch prerequisites

1. Complete safe rejected-event classification and command-response diagnostics, with protocol replay tests and independent review.
2. Establish an independently reproducible artifact manifest/seal before accepting experiment evidence.
3. Revisit the missing three-arm measurement with an explicitly new approval if it is still needed; never resume the consumed WI-0208 run.
4. Freeze these scenario fixtures and oracles, then present the exact model/run/budget proposal. No additional live testing is implied by design acceptance.
