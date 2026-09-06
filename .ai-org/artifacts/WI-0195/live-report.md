# WI-0195 live support comparison report

## Outcome

The freshly authorized successor experiment ran once and stopped after the first compatibility-gate arm. The stop is valid under the sealed zero-retry protocol. It did not complete a before/after pair, so there is still no measured Temple efficiency difference and no four-arm support comparison.

| Observation | Result |
| --- | --- |
| Attempted arm | `support-read / before` |
| Route | `gpt-5.6-terra`, medium |
| Recorded / planned arms | 1 / 4 |
| Whole-run elapsed | 73.258 seconds |
| Arm elapsed | 73.173 seconds |
| Parent input / cached / output | 126,472 / 95,232 / 994 |
| Parent observed Operational Tokens | 32,234 |
| Parent terminal | completed |
| Parent structured answer | retained, bounded and path-redacted |
| Bound helpers / expected | 0 / 1 |
| Helper messages attributed | 0 |
| Event journal | 568 total; 64 bounded recent records; no first failure |
| Cleanup | unconfirmed; 2 hashed actor hints unfinished |
| Stop reason | `interrupt-unconfirmed` |
| Retry / fallback | none |
| Out-of-scope product changes | none observed |

The Operational Token counter is last-observed parent telemetry, not a bill or a settled parent-plus-helper aggregate. The account UI still rounded weekly use to 0% immediately after this run; that display does not make the run free or establish exact account consumption.

## Answer evidence

The parent returned the correct TTL order—override, tenant configuration, default 300—and cited `cache.mjs` plus revision `4c55419693179e0d55019604354caf63c910ac5f`. A separate local check confirmed that revision's `cache.mjs` bytes match the fixture. This proves the parent produced a source-consistent answer. It does not prove those findings came from the helper: no helper message was attributable under the sealed correlation rules.

## What improved since WI-0193

WI-0193 stopped after 26.551 seconds at `unknown-item`, retained no answer and could not identify the rejected item. WI-0195 processed all 19 installed item kinds, retained 568 privacy-bounded event observations, observed the parent complete, and preserved a valid structured answer. The earlier recorder and schema failures are therefore repaired for this observed arm.

The remaining failure moved to child correlation. The current provider emitted a parent `subAgentActivity` hint and unbound child-thread events, but the recorder did not observe the validated parent `collabAgentToolCall` spawn-completion envelope required to bind that child. The policy correctly refused to infer helper identity, route, terminal state or usage from an activity hint alone. Consequently, the answer is usable as parent output while the support experiment remains unmeasurable.

## Recommended technical change

Add a two-phase native child-acquisition path rather than weakening authority:

1. A valid parent `subAgentActivity` event creates only a bounded quarantined candidate child ID.
2. The recorder explicitly resumes that candidate thread and requires the returned thread ID, model and reasoning effort to match the sealed route.
3. Only after that acknowledgement may the tracker bind the child and replay buffered events.
4. Absence, mismatch, extra candidates or terminal uncertainty must remain a named stop. Activity alone must never establish a child, grant write authority, or count usage.

Generation-free tests should cover acquisition success, route mismatch, duplicate/foreign hints, resume failure, early child events, terminal cleanup and nonduplicated usage remaining unknown. A later live probe requires a new seal and approval; this run's authorization was zero-retry and is spent.

## Safety and account state

One explicitly authorized reset was applied before the run because weekly use was 98%. It restored the weekly display to 0% and left one reset credit. No paid Credits were available or purchased, and automatic top-up was not used. No experiment runner or experiment-scoped App Server process remained after execution. The other three arms were not started.

Artifacts: `live-results.json`, `approval-source.json`, `live-approval.json`, `pre-run-account-state.json`, and `readiness-review-3.md`. Seal: `c5f2c676b43f18d610c626695caca37a07ae98483f54303a1df5672716251977`. Reviewed candidate: `879ac69f93cec6f1333de4e220da30edb51cce01`.
