# Proactive Engineering Learning Loop

Status: proposed design, not installed or implemented. Owner: Engineering Manager.
Governing boundaries: [Engineering Learning](../../../docs/extensions/engineering-learning.md).
This proposal adds operational follow-through, not model training or a new Position.

## Intended outcome

A useful finding should affect the next applicable decision without the human
having to request a retrospective each time. A repeated error should reveal
whether capture, retrieval, application or the guidance itself failed. Merely
creating a Lesson or returning a search hit does not establish improvement.

```text
Meaningful work outcome → bounded retrospective → scoped evidence/lesson
  → validation and intentional adoption → next-task application
  → outcome check → confirm, narrow, contradict or retire
```

## Trigger and non-trigger contract

Observe existing work outcomes, not every chat turn. After an authorized work
reaches completed, failed, cancelled or experiment-stopped, the owner performs a
small triage at the normal handoff. A material reviewer correction, a repeated
known failure or a violated prior expectation can also qualify. Repeated polling,
unchanged blocked status and the retrospective's own completion do not retrigger it.

| Situation | Proposed action |
| --- | --- |
| New reusable failure/correction with evidence | Capture one narrowly scoped candidate |
| Same known failure, new occurrence | Link occurrence to existing learning; inspect why it did not prevent recurrence |
| Existing guidance contradicted by new evidence | Propose revalidation/narrowing; do not silently rewrite or ignore it |
| Applied guidance succeeded or failed | Record the outcome against the application, including uncertainty |
| Routine success with no new insight | Skip; no Lesson, extra model call or separate retrospective document |
| Execution/usage/cleanup uncertain | Preserve the stop; defer analysis, never continue execution to get a cleaner lesson |
| User asked only for explanation/inspection | Remain read-only; no canonical learning write |
| Review date arrives | Surface a reminder; not automatic validation or a model run |

The work outcome and permission to capture must both be present. A terminal state
alone grants no write authority. Within an authorized reversible project work item,
bounded capture is routine; new spending, external sharing, policy or authority
changes retain their respective approval boundaries.

## Integration without a mandatory background service

Prefer a lightweight work-end signal emitted alongside existing handoff/closeout
and experiment results. The existing orchestrating Agent performs the semantic
review during normal work; no always-on Observer or extra model call is required.
A dormant repository cannot review itself. On recovery, inspect pending signals
through bounded context instead of pretending a background reviewer ran.

Phase one can use an explicit small record in the existing work artifact. A future
CLI-backed receipt/index must be separately designed and tested before becoming
canonical. Do not hand-edit current Learning JSON to simulate a missing command.
No automatic gate is added: routine no-insight work must remain cheap.

## Receipt, ownership and duplicate handling

Proposed idempotency key: Work Item ID + evidence revision/digest + outcome kind.
Keep only learning IDs, evidence references, disposition, owner and the changed
decision; do not copy prompts, chat history, raw provider events or credentials.

Triage dispositions: `no-new-learning`, `linked-existing`, `candidate-captured`,
`revalidation-needed`, `deferred`. Applied guidance separately tracks
`applied`, `not-applicable` or `not-found`, with a short reason. Outcome assessment
is `supported`, `contradicted`, `mixed` or `not-yet-observed`. These are proposed
record values, not new lifecycle states or existing CLI options.

Search the compact index before creating an entry. Match evidence/source-work-item
and scope first, then candidate lexical matches; semantic similarity is advisory.
Never silently merge conflicting conclusions. Revalidation of an existing lesson
uses the supported CLI when authorized; proposed edit/dedup operations require a
future supported CLI rather than unsupported hand edits. Concurrent updates must
use the existing atomic write/claim boundaries and preserve both evidence sources.

The work owner proposes observations. Engineering Manager handles triage and
missing follow-up; the relevant specialist validates applicability. Quality &
Evaluation challenges evidence; required Independent QA stays a distinct identity.
The human need not approve each routine observation, but Skill authoring,
always-on instructions, cross-project sharing and policy changes are not automatic.
Candidate capture does not activate a Practice. No universal rule follows from
one incident; intentional adoption and supporting evidence remain required.

## Apply and close the loop

At the next relevant planning/recovery point, retrieve validated Lessons and active
Practices. Record only the selected IDs and the actual decision they changed.
"Read PRACTICE-0002" is weaker than "reuse historical controls and execute only
two missing compact conditions." Retrieval must be tested with positive, unrelated
and multilingual cases; the current deterministic lexical search can miss Chinese
queries against English records. This proposal does not claim to fix that search.

After execution compare the expected effect to evidence. Preserve negative and
inconclusive outcomes. If the failure repeats, classify:

1. No capture or no validation: the lesson was unavailable.
2. Available but not retrieved: routing/application context missed it.
3. Retrieved but not applied: execution disregarded relevant guidance.
4. Applied but ineffective: guidance was incomplete, wrong or out of scope.

Do not reward lesson volume. Measure relevant recurrence with its denominator,
capture-to-application coverage, evidence-backed application outcomes and added
time/Token overhead separately. Missing telemetry remains unknown. A successful
retrieval or one successful task does not prove fewer incidents or global savings.

## Concrete Temple example

WI-0236 and WI-0239 stopped before all needed conditions were observed. WI-0240
validated the narrow evidence-reuse guidance against those outcomes and the
completed WI-0234 counterexample. The next experiment therefore uses retained
ordinary/old references and measures missing compact conditions first.

If both conditions finish, the coverage decision has supporting evidence for this
case, not proof that compact is faster. If one stops, preserve it and inspect its
cause; neither invent its result nor automatically rerun the old control matrix.
This is an application example, not a test of an implemented automatic loop.

## Acceptance and rollout, deferred until separately implemented

- Duplicate/replayed outcome signals cause at most one triage receipt, never two Lessons.
- Routine no-insight work triggers no model execution or extra guidance file.
- Unknown cleanup does not launch review workers, retries or further experiments.
- Read-only requests and unauthorized work cannot write Learning.
- Pending review survives a crash; recovery is explicit and bounded.
- A captured candidate is not retrieved as validated guidance or auto-promoted.
- Conflicting evidence preserves history and requests scoped revalidation.
- A relevant next work item links an applied decision and later outcome evidence.
- An unrelated task does not receive all Learning records; multilingual misses are visible.
- Disabled optional observers do not prevent normal in-session triage.
- No new permissions, spending or cross-project disclosure are inferred.

Start with deterministic lifecycle/replay fixtures and a few existing retrospective
cases before any live overhead comparison. Compare quality and extra administration
against the no-loop baseline using the same task; define an explicit stop decision
if recording costs exceed demonstrated utility. Do not implement this while testing
the compact-instruction treatment: that would introduce another experimental change.
