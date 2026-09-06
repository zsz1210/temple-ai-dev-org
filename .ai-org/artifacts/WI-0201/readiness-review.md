# Native helper lifecycle readiness review

Outcome: blocked. Candidate `ac618c029322e94a1444a14b9925124fa7a741f7` is not ready for a live attempt. Lulu reviewed independently of Developer Rikku as the claimed Quality Evaluator for this Lean Work Item. This is readiness evidence, not a Standard Independent QA gate or live compatibility success.

Reviewer runtime: `/root/wi0201_lifecycle_review`.

Seal digest: `8ffe3290217e518eff307fd5e42026bf060ae3f2956df1d9d0436b152883e21a`. Current HEAD, candidate Git contents, current bound files, and current generated Provider contract match the seal. WI-0196 through WI-0200 artifacts are unchanged relative to the candidate parent; the predecessor byte-identity test also passed.

## Blocking lifecycle defect

P1: spawn completion bypasses metadata confirmation. In `native-tracker.mjs:180`, a successful spawn completion directly calls `_bindChild(child, 'spawn-completion')`. In `executor.mjs`, metadata acquisition is reconsidered for activity hints on every event, but for spawn-bound children only when a spawn completion occurs. If the child turn starts after that completion and no activity event occurs, no metadata request is issued. The already-bound child can contribute messages, usage, terminal status and cleanup proof without validated parent, working directory or ephemeral retention.

The independent schema-valid replay reused the test fixture and its generated installed-Provider schemas, with this exact event order:

1. Parent spawn item started, then completed with one child and the expected model/effort.
2. Child turn started, followed by child message, usage and completed terminal.
3. Parent usage, valid structured answer and completed terminal.

The metadata fixture was configured with a foreign parent, non-ephemeral retention and a foreign working directory. It was never queried. Observed result: `status=observed-complete`, `metadataReads=0`, one helper with `acquisition_basis=spawn-completion`, both actors with usage and completed terminals, and `cleanup.status=observed-terminal`. This false success is sufficient to block readiness despite the passing existing tests.

The same direct-binding branch also permits attribution before an asynchronous metadata check finishes in event orders that do initiate a read. Both discovery paths must propose a candidate only. Successful schema and metadata validation must precede actor binding, buffered evidence attribution and completion eligibility. Add regressions for spawn completion before and after child turn-start, missing activity events, delayed metadata, mismatched metadata, and acquisition failure. Do not weaken the metadata checks to make the replay pass.

## Verified evidence and limits

The existing targeted event suite passed 28 of 28 tests. Its coverage exercises activity acquisition, event buffering, route/identity/retention mismatches, hostile writes, extra children, delayed helper completion, usage inconsistency, failed terminals and uncertain cleanup. These checks do not cover the demonstrated alternate acquisition bypass.

The real zero-generation API probe passed. Both ephemeral `thread/resume` variants returned JSON-RPC `-32600`, categorized `rollout-unavailable`. `thread/read` with `includeTurns:false` returned the matching identity, ephemeral flag, working directory, configured Terra/medium route and zero turns. This establishes installed API metadata behavior only; it does not prove native helper execution telemetry, subscription behavior or live end-to-end compatibility.

No model generation, live runner invocation, retry or external action was performed by this review. Full repository verification remains the Integration Owner's separately reported evidence; this review does not claim its result. Further tests stopped once the blocker was confirmed and rework was requested. The next action is an integrated acquisition repair, a new exact candidate and seal, then a new readiness review before any live attempt.
