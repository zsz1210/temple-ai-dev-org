# WI-0070 UI Runtime Review

- Delivery mode: `code-first`
- Surface: existing Management Console Now attention normalization and read-only Observer projection
- Layout/navigation changes: none

## States exercised

- eligible Practice: `skill_candidate_ready` with recurrence count and a local review action;
- pending proposal: `skill_proposal_pending` with proposal ID, evidence references, authority text, and a local CLI decision action;
- deferred proposal due: `skill_proposal_review_due`;
- inconsistent records: `invalid_skill_promotion`;
- no qualifying Practice: no Skill promotion attention.

## Result

The actual Observer HTML projection rendered the pending proposal ID and its authority boundary. The existing generic Now renderer preserves the same proposal label, message, evidence/authority payload, suggested action, and read-only source classification. The regression tests for the rendered Observer HTML and `Dashboard Now preserves read-only Skill Proposal evidence and authority attention` passed. No remote decision endpoint or private-viewer mutation was added.

## Boundary

This verifies the existing attention presentation contract. It does not claim a new dashboard layout, Human Inbox mutation flow, or visual redesign.
