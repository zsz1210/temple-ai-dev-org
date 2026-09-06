# WI-0196 independent Quality Evaluator review

## Judgment

**Changes required.** The candidate preserves activity quarantine and passes its current generation-free suite, but it can bind an activity-derived child when `thread/resume` returns no reasoning-effort value. That does not satisfy WI-0196's exact ID/model/effort acceptance boundary or the predecessor live report's required route acknowledgement. No live probe is ready or authorized from this revision.

## Reviewed candidate

- Revision: `832f3e483416a35a854e05d19cb775930627500f`
- Developer: `agent-rikku`
- Reviewer: `agent-lulu`, Quality & Evaluation Engineer
- Scope inspected: `.ai-org/artifacts/WI-0196/**`, WI-0196 canonical acceptance criteria, WI-0195 live report, and the sealed WI-0194/WI-0195 byte fixtures

## Verification performed

```text
node --test .ai-org/artifacts/WI-0196/events.test.mjs .ai-org/artifacts/WI-0194/events.test.mjs
46 passed, 0 failed

npm run verify
632 passed, 0 failed

git diff --check 9aa441e3b9025ea67dd6c1a136eae7fb3abac845..832f3e483416a35a854e05d19cb775930627500f
Only two trailing-blank-line warnings in new WI-0196 modules; no semantic diff error.

codex app-server generate-json-schema --out <temporary-directory>
ThreadResumeResponse.reasoningEffort permits null; the field is not required.

shasum -a 256 <sealed WI-0194 and WI-0195 inputs>
All six digests used by the candidate's predecessor-immutability test matched.
```

All checks were local and generation-free. No model, Provider turn, Credit, reset, retry, fallback, merge, release, or external write was used.

## Findings

### High — missing reasoning effort is accepted as exact acquisition proof

`executor.mjs` checks effort only when the Provider returns a non-null value:

```js
if (response.reasoningEffort != null) {
  demand(response.reasoningEffort === p.effort, 'child-resume-effort-mismatch');
}
```

The installed `ThreadResumeResponse` schema explicitly allows `reasoningEffort: null`, so this branch is reachable. The next line then calls `confirmActivityChild(child)`, binding the child and replaying its evidence despite effort remaining unknown. This contradicts:

- WI-0196 acceptance: exact `thread/resume` child ID, model, and effort verification before binding;
- WI-0195 live-report recommendation: the returned child ID, model, and reasoning effort must match the sealed route;
- the fail-closed rule that unknown route facts cannot become attribution evidence.

Required correction: do not bind when effort is absent. Preserve absence separately from mismatch with a fixed code such as `child-resume-effort-unconfirmed`; retain `child-resume-effort-mismatch` for a reported unequal value. Add a generation-free executor test in which `thread/resume` returns `reasoningEffort: null` and assert zero bound children, zero helper attribution, unconfirmed cleanup, and the exact stop code.

### Medium — required adversarial paths are not proven through the executor result

The suite tests duplicate spawn and second-candidate overflow directly on `NativeTracker`, but it does not drive foreign/nested activity, duplicate spawn confirmation, or malformed/regressing usage through `runSubject`. In `runSubject`, tracker exceptions are collapsed to top-level `event-contract-violation`; the exact tracker reason may survive only in the trace or journal. The current tests therefore do not establish which stable code a persisted experiment result exposes for every failure path named by the acceptance criteria.

Required correction: add fake-Provider executor cases for foreign/nested activity, duplicate spawn confirmation, usage inconsistency/regression, and candidate overflow. Assert the intended fixed code at the documented result location, zero unauthorized attribution, and cleanup uncertainty where applicable. If the public fixed code is intended to live in `trace.stop_reason` or `event_journal.first_failure.code` instead of top-level `stop_reason`, state that contract explicitly and test it.

## Confirmed behavior

- Parent activity alone remains a bounded candidate and does not create a child actor.
- Exact ID/model/reported-effort acknowledgement binds one child and replays early events.
- Activity-first and late-spawn ordering produces one actor and one resume request in the covered race.
- A second spawn confirmation is rejected by the tracker.
- Helper file changes stop the executor.
- Missing child terminal/failed interrupt remains cleanup-unconfirmed.
- Parent-plus-child Operational Token aggregation remains `null` while non-duplication is unknown.
- Persisted actor and candidate identifiers are SHA-256 digests.
- Sealed WI-0194 and WI-0195 evidence remains byte-identical to the recorded fixtures.

## Live-compatibility and privacy limits

This review does not establish current live App Server compatibility. `runSubject` itself caps each retained message string but not the message count or structured answer size; the persistence-safe 64-message/32-KiB-answer sanitization still lives in the sealed WI-0195 runner, which imports the WI-0194 executor rather than this successor. Before any WI-0196-based live probe, a new sealed runner must import the repaired executor, apply bounded path-redacting sanitization before the first write, bind that sanitizer and the current Provider schemas into its seal, and pass the existing adversarial retention tests. This is a live-readiness requirement, not evidence that the generation-free acquisition state machine contacted or leaked through a Provider.

