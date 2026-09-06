# WI-0196 corrected-candidate Quality Evaluator review

## Judgment

**Pass for the generation-free WI-0196 acceptance boundary.** Exact candidate `fd53d7dea73ae4da6143e60e62dd60f3eb8d04f4` closes both findings from the rejected `832f3e483416a35a854e05d19cb775930627500f` review. Missing reasoning effort fails closed before binding, and the required adversarial paths now execute through `runSubject` with persisted-result assertions. This judgment does not approve or authorize a live Provider probe, merge, release, publication, Credit use, reset, retry, or fallback.

## Reviewed candidate and provenance

- Work Item: `WI-0196`
- Exact candidate: `fd53d7dea73ae4da6143e60e62dd60f3eb8d04f4`
- Rejected predecessor: `832f3e483416a35a854e05d19cb775930627500f`
- Developer: `agent-rikku`
- Reviewer: `agent-lulu`, Quality & Evaluation Engineer
- Developer handoff: `.ai-org/artifacts/WI-0196/handoff-002-developer-to-quality_evaluator.md`
- Developer evidence: `.ai-org/artifacts/WI-0196/rework-test-report.md`
- Review inputs: the prior `review.md`, corrected `design.md`, `executor.mjs`, `events.test.mjs`, `native-tracker.mjs`, exact Git diff from the rejected revision, and the sealed predecessor byte fixtures

The behavioral files named above matched the exact candidate during review. Canonical lifecycle files and the second handoff were already modified or untracked by the parent delivery flow; this review did not alter, certify, or include those working-tree changes in the candidate judgment.

## Independent verification

```text
node --test .ai-org/artifacts/WI-0196/events.test.mjs .ai-org/artifacts/WI-0194/events.test.mjs
52 passed, 0 failed

npm run verify:fast
54 passed, 0 failed

npm run verify
632 passed, 0 failed

git diff --exit-code fd53d7dea73ae4da6143e60e62dd60f3eb8d04f4 -- <WI-0196 behavioral and evidence files>
passed; the reviewed working copies matched the exact candidate

shasum -a 256 <six sealed WI-0194/WI-0195 inputs>
all six digests matched the expected fixtures in events.test.mjs

git diff --check 832f3e483416a35a854e05d19cb775930627500f..fd53d7dea73ae4da6143e60e62dd60f3eb8d04f4
one existing blank-line-at-EOF warning in review.md; no behavioral-source whitespace error
```

All verification was local and generation-free. No live model or Provider turn was called, and no Credit, reset, retry, fallback, external write, merge, or release action occurred.

## Resolution of prior blocking findings

### 1. Null reasoning effort now fails closed before binding — resolved

`resumeChild` now requires a non-null `response.reasoningEffort` before it compares the value or calls `tracker.confirmActivityChild(child)`. Missing effort produces the distinct top-level result code `child-resume-effort-unconfirmed`; a reported unequal effort remains `child-resume-effort-mismatch`.

The executor-level null-effort case proves:

- `stop_reason` is exactly `child-resume-effort-unconfirmed`;
- `trace.observed_children` remains zero;
- no helper actor is present, so no helper usage or message can be attributed;
- cleanup remains `unconfirmed` for the unbound candidate.

This satisfies the exact child ID/model/effort acquisition boundary.

### 2. Executor-level adversarial result coverage — resolved

The corrected suite drives the previously missing cases through the fake-Provider `runSubject` path rather than testing only `NativeTracker` in isolation:

- nested activity exposes `invalid-child-activity` and never creates a grandchild actor;
- a foreign activity event is quarantined, causes no `thread/resume`, creates no helper actor, attributes no usage, and ends with deterministic `interrupt-unconfirmed` cleanup;
- candidate overflow exposes `child-activity-limit` without creating the excess actor;
- duplicate spawn confirmation exposes `child-limit-or-duplicate` without duplicating the bound child;
- inconsistent usage exposes `usage-inconsistent`;
- regressing usage exposes `usage-regressed`.

The allowlisted event-contract codes are retained at top-level `stop_reason`; unknown tracker exceptions still collapse to `event-contract-violation`. This is adequate for the accepted safety boundary because every named case is exercised through the persisted executor result and cannot acquire unauthorized attribution.

## Predecessor preservation and privacy

The four sealed WI-0194 implementation/test files and the two WI-0195 live-result files remain byte-identical to their recorded SHA-256 values. The correction changes only successor WI-0196 material.

No new raw-output or identifier exposure was introduced by the correction. Actor and candidate identifiers remain SHA-256 digests, unverified observations remain quarantined, and child Token aggregation remains `null` while parent/child non-duplication is unproven.

## Non-blocking observations

- Foreign activity currently surfaces as the cleanup result `interrupt-unconfirmed`, not a dedicated causal `foreign-activity` code. The behavior is deterministic and fail-closed, and the test proves no resume or attribution, but a future diagnostics-only refinement could distinguish the initiating observation from the cleanup consequence.
- The corrected-candidate report's bare `git diff --check` checks the current working-tree delta, not the full rejected-to-candidate range. The full range contains only the prior review document's blank trailing line. This does not affect the acquisition behavior or test outcome.

## Remaining live-probe boundary

WI-0196 establishes the local acquisition state machine only. Before any live compatibility claim, a new separately reviewed and sealed runner must:

1. import this repaired executor rather than the sealed WI-0194 executor;
2. apply bounded message and structured-answer retention plus path redaction before the first persisted write;
3. bind the sanitizer, exact runner bytes, current App Server schemas, route, limits, and zero-retry/fallback policy into the seal;
4. pass retention, route-mismatch, cleanup, and predecessor-preservation tests;
5. receive fresh exact user approval for any Provider generation and resource envelope.

This pass is not evidence of live App Server compatibility, observed helper measurement, Token efficiency, comparative quality, or delivery improvement.
