# ADR-0066: Track Learning review coverage without automatic retrospectives

Status: Accepted for bounded implementation, 2026-09-09.

## Problem and decision

The existing Learning index describes Lessons and Practices. A Work Item with no
linked Lesson may never have been reviewed or may have produced no new lesson.
Record explicit reviews separately, keyed by Work Item and a digest of its exact
terminal outcome and evidence. Keep the existing index unchanged.

The CLI records a human/agent-authored judgment, not proof of its correctness.
`no-new-lesson` requires no Lesson links; `linked-lessons` requires existing Lesson
IDs. Both require a review note and an active Agent Identity. No mandatory model
call, lifecycle gate, background reviewer, promotion or historical migration is added.

Coverage is `not-reviewed`, `no-new-lesson`, `linked-lessons`, `review-required`,
`not-eligible` or `unknown`. Terminal items require a full tested revision or,
where testing did not finish, a recorded Developer candidate. This does not turn
an interrupted candidate into accepted delivery. Outcomes lacking those revisions
remain unknown. The snapshot includes scope, acceptance, unresolved issues,
terminal state/outcome, candidate revisions, evidence and gate references. Local
evidence content is hashed; normalized Evidence IDs resolve to their record files.
Full Git revisions and external URLs are retained as opaque references, never
fetched. Unsupported references make coverage unknown. Claims, timestamps and
other administrative fields do not invalidate a review.

Review files are immutable project-owned records below
`.ai-org/learning/reviews/WI-ID/OUTCOME_DIGEST.json`. Identical retries are no-write;
conflicting judgments for an unchanged outcome fail instead of replacing history.
A changed review note or Lesson makes the prior review stale; restoring the original
content restores its coverage. A correction requiring a new judgment must first
have a genuinely updated outcome/evidence; this version has no correction command.

Single-item queries read only the named Work Item, its review records and relevant
evidence/Lesson references. All-item queries scan Work Item metadata, then only
read evidence for items with records. Status and Doctor inspect this optional
store only when present. No derived coverage file becomes lifecycle authority.
Malformed/missing evidence is unknown; malformed storage is a Doctor failure.
Symlinks, absolute/traversal paths and unexpected record entries are rejected.
Writes use the existing project mutation lock and exclusive atomic creation.

## Consequences and acceptance

This gives an auditable answer to what was reviewed without loading every Lesson
body. Content hashing has filesystem cost proportional to the reviewed evidence;
there is no claim of sublinear all-project querying or measured Token savings.
No semantic retrieval dependency is justified by this feature. Test idempotency,
outcome and evidence changes, malformed input, unsafe storage, concurrency,
no-write queries and existing-data preservation. Independent QA must validate the
exact candidate. Existing Learning validation/promotion boundaries remain intact.
