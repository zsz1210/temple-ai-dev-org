# Native helper lifecycle repair

## Root cause and evidence boundary

The previous tests mocked a successful thread/resume on an ephemeral child. The installed Provider does not resume an ephemeral thread even with omitTurns: true: a zero-generation real-interface probe reproduced JSON-RPC -32600, categorized as rollout-unavailable. The same in-memory thread supports thread/read with includeTurns: false, returning configured model and reasoning effort. This explains why prior mocked successes were insufficient; it does not recover the exact discarded error from WI-0200.

Official reference: https://learn.chatgpt.com/docs/app-server. Version-specific generated Thread metadata describes model and reasoningEffort as configured values, not per-turn execution telemetry. Preserve that distinction.

## Complete lifecycle

1. Keep the no-history helper instruction and ephemeral memory isolation.
2. Correlate a parent activity with the native child turn-start in either arrival order. Do not issue metadata reads on arbitrary foreign thread IDs or before a child is running.
3. Read metadata once with includeTurns: false. Validate the response schema, exact child ID, parent ID, working directory, ephemeral retention, configured model and non-null effort before attributing buffered evidence.
4. Consume already-streamed native events. A metadata read is not a subscription, model call, history resume, or execution-telemetry assertion. No read retry or alternate endpoint fallback is automatic.
5. Wait for the parent and the expected helper terminal events, not just the parent followed by a 500 ms drain. Preserve the deadline and Token ceilings. Missing usage or malformed output cannot pass.
6. On failure, interrupt only validated actors with observed turns; retain unknown cleanup for unbound hints. An interrupt acknowledgement or process exit is not terminal proof.
7. Retain bounded RPC code/category diagnostics, never raw messages, paths, prompts or hidden reasoning.

## Validation

The real no-generation API probe complements schema-validated event replays. Replays cover delayed helper completion, child events before parent activity, metadata mismatches, unknown effort, retention and parent drift, failed acquisition, hostile writes, extra children, nested events, Token inconsistency, and uncertain cancellation. Sealed WI-0196 through WI-0200 artifacts remain unchanged.

Live model compatibility remains a separate exact-seal reviewed test; this repair does not reopen prior run-once records or remove acceptance guards to obtain a pass. No broad efficiency claim follows from this compatibility test.
