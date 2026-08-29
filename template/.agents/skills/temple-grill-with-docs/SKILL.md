---
name: temple-grill-with-docs
description: Stress-test a proposal against repository documents and code, then persist a sourced Decision Ledger and ADR proposals. Use when existing project evidence may constrain the answer.
---

# Temple Grill with Docs

Run a decision interview grounded in the target repository rather than relying on chat memory.

## Evidence pass

1. Confirm the target outcome and the repository or document scope.
2. Read the smallest authoritative set: root instructions, Temple assignments, relevant Spec/Design/ADR, nearby implementation, tests, and current Git state.
3. Cite exact repository paths when reporting a constraint. Distinguish current evidence from historical notes and generated views.
4. Build a short map of established facts, conflicts, missing evidence, terminology drift, and decisions that are still open.

Do not scan unrelated private content, modify files during the evidence pass, or treat generated diagrams and chat summaries as higher authority than source files.

## Interview

- Ask no more than three high-leverage questions per round by default.
- Lead with contradictions or decisions that would invalidate downstream work.
- Offer bounded options with consequences when useful; preserve a user-provided option even if another appears preferable.
- Track facts, assumptions, confirmed decisions, unknowns, and rejected alternatives separately.
- Do not implement unless the user explicitly asks after the decision work.

## Persisted outputs

For each confirmed decision:

- Update a focused Decision Ledger under `.ai-org/decisions/`.
- Add source paths and revision information.
- Propose an ADR when the decision affects architecture, organization-wide policy, long-lived interfaces, security, data ownership, or costly reversibility.
- Propose a glossary update when different files use conflicting terms.
- Identify downstream Spec, Design, task, test, and migration updates; do not mark them completed until changed and verified.

End with the decision frontier, evidence gaps, proposed ADRs, and the next responsible Position.
