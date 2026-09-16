# Console refresh test synchronization

Baseline `5b2b6c6d5dc96c2ccc8267f5cab44347c8ff1e80`; Developer Rikku.
Only the optional Console test changes. Production server, timeout, concurrency,
dependencies and assertions in unrelated tests are unchanged.

## Diagnosis

The original focused case passed 60/60 attempts (12 at four concurrent processes,
48 at eight). An instrumented baseline complete test run also passed 1248/1248,
zero fail/skip/cancel/todo, 251888.052125 ms. Its Console case passed in
1896.719666 ms with a watcher callback followed by SSE delivery. These diagnostic
runs do not reproduce every historical full-suite failure.

A separate native fs.watch probe on Node v24.20.0/libuv 1.52.1 missed 5/24 writes
made immediately after directory-watch registration. No event arrived within
1650 ms; a later write recovered all five cases. This demonstrates a startup
notification gap on this host, not an all-platform timing guarantee.

[Node issue 52601](https://github.com/nodejs/node/issues/52601) describes macOS
watch startup without a readiness event; [Node issue 54450](https://github.com/nodejs/node/issues/54450)
also explains native startup event timing in tests. These support the mechanism,
not a claim that every historical Temple timeout has been conclusively attributed.

A bounded fault-injection preload discards native watcher callbacks for the first
400 ms, then resumes normal delivery. On the original test it dropped one event,
delivered none, and failed at the unchanged 30-second deadline (31312.483375 ms
runner duration). On the corrected case it dropped eight startup events, delivered
five subsequent events, and passed (1565.118667 ms runner; case 1438.156208 ms).

## Correction and focused results

The disposable fixture writes a setup marker until an actual Console refresh
round trip proves delivery is active. The setup writer is stopped and awaited
before acceptance work; errors race the reader, and one original deadline bounds
setup and assertions. SSE frames are assembled across chunks rather than assuming
read boundaries are messages. Two sequential canonical name changes each require
a subsequent revision and matching fresh snapshot content. They are not retried.
The stream is aborted and the Console closed before fixture removal. An initial
editing check exposed expected AbortError propagation during iterator cleanup;
cleanup now ignores only the known cancellation, preserving substantive errors.

`node --test test/optional-console-collector.test.mjs`: 7/7 pass, zero failures,
skips/cancellations/todos, 4067.821042 ms. Corrected focused case: 24/24 pass with
eight concurrent processes; slowest process 2.302 seconds. Existing test count
is unchanged. No production polling or startup sleep was added.

## Final candidate gates

Exact candidate `f1629909739eb08b4616e39d68065da74d29f5d2` passed
`npm run verify`: repository/document/package checks and 1248/1248 tests, zero
failures/cancellations/skips/todos, 291757.777459 ms. The strengthened actual
Console case passed in 2259.067584 ms. This is the single final candidate full run;
the earlier baseline diagnostic run is separately identified. Production, test,
script, dependency and CI bytes remain unchanged from the candidate.

`npm run test:browser` exited 0 with Chrome 152.0.7977.84: four viewports,
six primary views, reduced motion and six synthetic attention states passed.
The full and browser runs overlapped, so total time is not a controlled performance
comparison with the earlier baseline run. No speedup claim is made.

Distinct QA exercised eight framing/writer cleanup controls and verified that
forwarding setup events while suppressing actual project-change events still
fails at the unchanged deadline. Its separate substantive acceptance judgment is
in `independent-review.md`. Public log copies redact home paths; provenance maps
their hashes to local originals. The native platform limitations remain unchanged.
