# Independent QA — WI-0117

- Candidate: `b8f41dd0e1255526f63c0e541ea480ef3d35e059`
- Independent QA: Lulu (`agent-lulu`)
- Implementation decision: **PASS**
- Release decision for comparison claim: **NO-GO / INCONCLUSIVE**

Independent QA created a fresh detached checkout at the exact candidate, installed the locked dependency set offline with lifecycle scripts disabled, and ran the complete repository verification. All 309 tests passed with no failures, skips, cancellations, or candidate-tree changes.

The evidence preserves the experiment's key boundary: all four candidate implementations passed objective acceptance, but neither evaluator produced a valid frozen subjective-quality score. Attempt 1 stopped at its approved Token ceiling. Attempt 2 exposed a score-scale contract mismatch and stopped before freeze. The sealed mapping was never joined into a qualified result, and no retry or fallback occurred.

The repaired evaluator schema, prompt, approval parser, and stopped-result diagnostics are internally consistent and covered by regression tests. They do not retroactively validate the discarded score output or authorize another model turn. The Work Item may close as a successful fail-closed validation with a no-go decision; it may not support a matched-quality, efficiency, savings, superiority, billed-cost, or routing claim.
