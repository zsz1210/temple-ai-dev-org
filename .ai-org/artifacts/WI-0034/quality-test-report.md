# Quality test report — WI-0034

- Candidate revision: `7a52896443e5055bd0b572f1df30e1536488c90f`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Result: **pass to Eval**

## Counterexamples checked

1. **Unrelated refresh destroys in-progress input:** rejected by direct draft reconciliation coverage; text, selection, operation, and focus survive when the target fingerprint remains current.
2. **Changed target silently retains authorization:** rejected; the draft remains visible but confirmation is cleared and the changed precondition is explained.
3. **Connected SSE implies safe mutation:** rejected; snapshot freshness is independently derived and stale or failed snapshots disable actions while preserving prior information.
4. **Historical failures dominate current attention:** rejected; terminal failures remain auditable but only nonterminal actionable conditions appear in the primary attention list.
5. **Terminal history obscures present work:** rejected in the live snapshot; nine current items precede a collapsed 28-item terminal history group.
6. **Replay time is presented as occurrence time:** rejected; canonical rows use occurrence time and do not gain duplicate repository replay rows.
7. **Private and narrow surfaces regress:** rejected by the 2-test private-viewer boundary and the 420-pixel live inspection with no horizontal overflow.

The fresh Quality suites passed 31/31 with zero failures, skips, cancellations, or TODOs. No blocking current-state or private-viewer counterexample was found.

## Evidence boundary

Quality evaluated a live integrated snapshot only after confirming every WI-0034 affected path was byte-identical to the candidate. The result does not authorize remote Agent Commands, public access, release, or deployment. Independent QA must still reproduce the exact candidate from a clean checkout.
