# Console refresh reliability

Maintainer authorized the recommended intermittent Console notification repair.
Baseline: `5b2b6c6d5dc96c2ccc8267f5cab44347c8ff1e80`. Developer Rikku;
distinct evaluator and Independent QA Lulu; Principal human. Standard profile.

Investigate the path from actual canonical file write through filesystem watcher,
debounced invalidation, SSE subscription and reader. Use bounded disposable
fixtures and diagnostic instrumentation; distinguish a reproduced mechanism from
unproven explanations for historical timeouts. Implement the smallest supported
repair. Keep the mandatory real event assertion, existing timeout, read-only
Console boundaries, optional runtime and provider behavior. Do not introduce
repository polling, background processes, dependencies or permission changes.

Acceptance: reproducible before/after control for any correction; actual file
changes deliver refresh signals including repeated/subsequent changes; stream,
timer and watcher cleanup remains bounded. Focused checks, one final complete
`npm run verify`, applicable `npm run test:browser` and distinct exact-candidate
review are required. Repeat a full run only after a changed candidate or a new
unresolved failure justifies it, retaining each attempt. No timeout inflation,
test deletion, reduced full-suite concurrency or retry-until-green loop.

Design will follow diagnostic evidence. Prefer synchronization or lifecycle
repair over polling. This is backend event delivery; no visual ownership or
layout change is planned. Scope is the Console server, related tests and this
item's evidence. Complete local acceptance and ordinary PR integration with CI;
no package release, live provider calls, app/process cleanup or new experiment.
Rollback: revert the scoped repair and rerun full verification and Doctor.

## Diagnosed design

Sixty original focused executions passed (12 with four concurrent processes, then
48 with eight). A separate Node 24.20.0/libuv 1.52.1 native startup probe missed
five of 24 immediate writes even after 1650 ms; every missed case recovered after
a subsequent write. This reproduces a platform startup notification gap, without
claiming it explains every historical failure. Node's own issue 52601 records the
absence of a macOS fs.watch readiness event. A controlled 400 ms startup-drop
preload also makes the original actual Console test time out at its unchanged
30-second deadline.

The smallest correction is test synchronization: establish a real end-to-end
watcher/SSE round trip with bounded disposable fixture writes before performing
the single acceptance mutation. Parse SSE frames across chunks; require real
refresh events and fresh snapshot content for two successive canonical changes.
The setup probe is not an assertion retry: a broken delivery path still fails
within the original shared deadline. Await and stop the setup writer on success
and error; abort the stream and close the server before removing fixture files.
Keep production Console code unchanged rather than adding polling or pretending
a fixed startup sleep guarantees native readiness. Retain explicit platform
limits and the diagnostic full-load attempt in the evidence.
