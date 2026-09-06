# WI-0194 corrected candidate re-review

Reviewer: `agent-lulu`, Quality & Evaluation Engineer, distinct from Developer `agent-rikku`.
Prepared worker: `worker-20260906025851-3e0d8db8`.
Exact candidate: `f9edc11a207ffd6488102fe427e5d82c103514e5`.
Decision: accept for the bounded Lean local recorder repair. No remaining blocking finding in the reviewed scope. This is not Standard Independent QA, release authorization, or live compatibility evidence.

## Corrected findings

The two blockers in `review.md` are resolved. `knownType` now requires a primitive string before `Object.hasOwn`; malformed JSON item types are recorded as fixed `unknown` labels and fixed type categories, without coercion or raw values. The actual executor callback now retains schema failure metadata and reaches known-parent interruption and connection close for objects with invalid `toString`, arrays, null, numbers, and booleans.

The executor collects at most 64 distinct hashed actor hints before schema validation. Unknown actors from invalid notifications remain in cleanup uncertainty after the known parent terminates. The hints are consulted only by cleanup accounting; they do not enter the tracker actor map, authorize subscription or interruption, or establish terminal status. Overflow remains explicitly `unconfirmed`. The regression replay confirms zero bound children, no child resume, one known-parent interrupt, and the unknown child's hash in unfinished actors.

## Evidence

- Verified HEAD equals the exact candidate above; `git diff` against it was empty for `event-policy.mjs`, `executor.mjs`, `native-tracker.mjs`, and `events.test.mjs`.
- Independently ran `node --test .ai-org/artifacts/WI-0194/events.test.mjs`: 33 passed, zero failed/skipped, 15,040.147 ms. Tests generate the installed provider schemas locally and replay notifications through the real executor with a fake transport; no model inference occurs.
- Independently challenged the journal with nine malformed/prototype-name values: empty object, object with invalid coercion members, empty array, array containing a known item name, `__proto__`, `constructor`, boolean, null, and number. All classified as unknown without throwing or retaining private sentinel content.
- The focused suite also rechecked all 19 installed item kinds, schema drift, child events before/after spawn completion, failed/interrupted spawn, malformed terminal events, bounded retention, and exact byte preservation of the sealed WI-0193 executor/tracker against `2628319f75c01d1bf9d9879569b504ab40f44b1f`.
- Parent-reported full repository verification: `npm run verify`, 632/632 passed, approximately 150.6 seconds; parent reports root source/test/scripts/package content unchanged since that run. This reviewer independently ran the focused suite, not the full suite.

## Limits and stop boundary

This acceptance covers generation-free local repair and deterministic replay against the installed schema. It does not establish provider delivery behavior, live compatibility, missing comparison outcomes, model effectiveness, or nonduplicated parent/child aggregate usage. The bounded untrusted hints intentionally preserve uncertainty and do not grant actor authority. No live probe or comparison retry is authorized by this review.

Only this report was written by the reviewer. No implementation changes, sealed WI-0193 edits, commits, canonical lifecycle mutations, or model runs were performed. The parent owns evidence integration and Lean closeout.
