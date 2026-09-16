# Independent review: Console refresh test synchronization

Reviewer: `agent-lulu`, Principal `human`, worker
`worker-20260916062712-2e1f6dc1`, claim
`claim-20260916062712-1d9eb492`. Current assignments and claim history confirm
Developer `agent-rikku` is distinct from this reviewer. Candidate:
`f1629909739eb08b4616e39d68065da74d29f5d2`; baseline:
`5b2b6c6d5dc96c2ccc8267f5cab44347c8ff1e80`. Runtime: Node v24.20.0,
libuv 1.52.1, macOS arm64. Review is scoped to the approved Standard work item.

## Scope and source review

The only executable change is `test/optional-console-collector.test.mjs`.
Production Console code, dependencies, the 30-second deadline and full-suite
concurrency are unchanged. The correction establishes an actual filesystem-to-SSE
round trip before acceptance mutations. This is test startup synchronization,
not a product native-watcher reliability repair. Native notification loss remains
an underlying platform limitation. The diagnostic startup gap is a reproduced
mechanism, not proof of the cause of every historical failure.

The source retains mandatory delivery checks, adds two distinct canonical name
changes and checks fresh snapshot content. The setup writer is stopped and
awaited before those changes. The shared abort signal bounds setup and delivery;
the stream is aborted, then the server closed before fixture removal. Snapshot
cache invalidation and subsequent revisions are now checked instead of merely
finding an event label. The parser correctly targets the server's LF-delimited,
single-data-line wire format; it is not presented as a general SSE parser.

## Independent adversarial evidence

The reviewer executed eight small checks against verbatim extracted candidate
helper functions, with injected filesystem behavior only where necessary:

- Coalesced frames and one-byte chunks, including split multibyte UTF-8, deliver
  both revisions and preserve payload text; exhausted streams reject.
- Missing refresh data and malformed JSON reject instead of passing.
- Successful readiness stops further writes; filesystem errors surface unchanged.
- Parent cancellation and reader failure stop and await the setup writer.

All eight passed. Extracted helper SHA-256:
`e9d0d161fd5bd5575d9ba1938a524cc52f203247e67b1b2727d5669b26f2d08a`.
Temporary reproducible inputs: `wi0242-qa-helpers.mjs` and its matching log.

A separate negative control ran the exact real candidate test while a preload
forwarded readiness-marker watcher callbacks and suppressed only `project.json`
callbacks. It correctly failed with `Console refresh signal timed out`: zero
passes, one intentional failure, zero cancellations/skips/todos. Three callbacks
were forwarded and one acceptance-file callback suppressed. The test case took
32389.757625 ms and runner 32922.847917 ms while the full suite was active; the
configured deadline remained 30000 ms. This demonstrates that successful setup
traffic does not by itself satisfy the subsequent acceptance check. No retries,
timeout inflation, source changes or test changes were used in this control.
Temporary inputs: `wi0242-qa-drop-project.mjs` and its matching log.

No implementation defect was found. These bounded controls do not prove the
absence of every possible OS notification failure or scheduling delay.

## Gate judgment

Overall Independent QA judgment: **PASS** for the scoped test synchronization
on `f1629909739eb08b4616e39d68065da74d29f5d2`.

The reviewer independently inspected the parent's final candidate logs and
rechecked that source, tests, scripts and package manifests match that revision.
`npm run verify` completed successfully: 1248/1248 passed, zero failures,
cancellations, skips or todos, 291757.777459 ms. The real refresh case passed in
2259.067584 ms. The browser gate passed all four viewports (mobile, tablet,
desktop and ultrawide), all six primary views, reduced motion and six synthetic
attention states. The reviewer did not duplicate the full suite or browser run.

The earlier diagnostic baseline run is kept separate from this final candidate
evidence. The intentional independent fault-injection failure is a successful
negative control, not a hidden retry of a failed candidate gate. Acceptance is
for this bounded harness improvement; it does not claim universal native watcher
reliability or conclusive historical causation. No package publication or
unrelated follow-on task is authorized by this review.
