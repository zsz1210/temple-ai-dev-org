# WI-0174 — Independent QA report

## Decision

**FAIL** — do not advance this candidate to Release Gate.

## Identity and revision

- Independent QA: Lulu (`agent-lulu`)
- Developer under review: Rikku (`agent-rikku`)
- Candidate tested: `aefa50ba9fb4ca150ba4f8b86d5bbebb1010533f`
- Parent revision: `6d3a87b8b1742ab9096282ac557474452b1c8c5d`

Assignments confirm that the Developer and Independent QA identities differ. This report is independent QA evidence only; it neither repairs the candidate nor changes lifecycle state.

## Passing evidence

```text
node --test test/work-item-rework.test.mjs test/high-assurance.test.mjs
tests 18
pass 18
fail 0
skipped 0
duration_ms 23905.914833
```

The focused suite independently covered supported review stages, repeated rework, rejected revisions, normalized and path-normalized retired evidence, High-Assurance exact-candidate evidence, reviewer identity/binding, active runtime/resource rejection, scope/authority drift, and ordinary closeout after a corrected candidate.

## Defect

### High — a failed valid rework invocation partially changes canonical lifecycle state

`reworkWorkItem` writes the prepared Work Item before it appends the `work_item_reworked` event. In a disposable clone of the exact candidate, QA made only the event-stream target unavailable (replaced `.ai-org/events/events.jsonl` with a directory) after valid fixture setup. A valid rework command then exited nonzero:

```text
Temple error: EISDIR: illegal operation on a directory, read
```

Despite that failure, the Work Item changed as follows:

| Field | Before | After |
| --- | --- | --- |
| `state` | `independent_qa` | `build` |
| `owner_position` | `independent_qa` | `developer` |
| active claim | active | released |
| `rework_history` length | 0 | 1 |

The append-only event is absent because its persistence failed. This is a lifecycle/audit integrity failure: callers receive an error for a request that has nevertheless returned the candidate to Build and released its reviewer claim. It conflicts with the bounded requirement that failed requests do not mutate and leaves canonical Work Item state without its corresponding event record.

## Limits

- This is a local, isolated persistence-failure probe; it does not establish cross-machine or production filesystem behavior.
- The full verification result (480 passing tests) was supplied by the Developer and is not repeated here; this report independently ran the requested focused suite only.
- No repair, lifecycle mutation, release, external action, model trial, push, or merge was performed by Independent QA.
