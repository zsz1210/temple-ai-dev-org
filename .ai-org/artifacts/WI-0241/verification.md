# WI-0241 verification

## Exact candidate and boundaries

Behavioral candidate: `e9affdf8`; full verification revision: `afb048d1`.
The only change between these commits is a corrected relative Markdown link.
The Learning loop is design-only. Actor runtime, installed instructions, Learning
schema/index, source evaluator and old sealed results are unchanged.

The new coordinator mode is an additive fixed two-condition screen, not a generic
resume/subject filter. Existing four/six protocols keep their original model,
per-subject ceilings, order validation and continuation. No live model subjects,
new Token-efficiency measurement, reset, purchase, merge or release occurred.

## Observed checks

- Focused continuity runner tests: 23/23 passed, exit 0, 12,192.417667 ms. This
  editing aid preceded the final duplicate-root/mixed-protocol assertions; the
  full run below covers those assertions on the final behavioral candidate.
- First `npm run verify` stopped at the documentation-link check, before the full
  suite: the design link used one extra parent directory. Corrected in `afb048d1`.
- Fresh `npm run verify` on `afb048d1`: repository, documentation links and package
  checks passed; **770/770 tests passed**, exit 0, 190,760.847208 ms test duration,
  Node.js 24.20.0. The existing recursive `node:test` warning was emitted; no
  failed, cancelled, skipped or TODO test appears in the summary.
- Doctor after the initial canonical mutations: 36 pass, one stale generated
  parallel-plan warning, zero failures. This sequential preparation dispatches
  no worker, so it neither relies on nor treats that old plan as current. Any
  future dispatch needs a fresh applicable preparation, not a warning bypass.
- Fresh real-provider generation-free preparation and provenance checks passed
  as detailed in [readiness](readiness.md). Node.js 24.19.0 is the standalone
  sandbox runtime, matching the prior lab's runtime path. No `turn/start` was sent.
- Evidence and handoff follow-up: `npm run verify:fast` passed repository/link/
  package checks and 54/54 fast tests, exit 0, 1,128.051959 ms test duration. This
  validates the later prose/state packaging, not a replacement full-suite result.

The test extension exercises two valid conditions, missing/extra/swapped subjects,
duplicate roots, wrong arm/previous variant, wrong pair/root, mixed preparation,
wrong digest and enlarged envelopes. Existing tests retain ledger cancellation,
unknown usage, cleanup and policy guards. Consumed approval continues to use the
existing exclusive write; no new live replay test or bypass is claimed.

## Review judgment and remaining work

Developer checks support the bounded candidate and its generation-free readiness.
They are **not Independent QA**. No distinct reviewer has accepted this revision
in this work item yet; Standard QA/Release Gate are not complete.

The maintainer was asked to approve the exact new digest and two-subject limits
with distinct QA before execution. Until that answer and review exist, keep the
fresh lab unconsumed. Do not interpret the old six-subject approval, 770 passing
offline tests, or this handoff as permission to generate.

If later authorized, preserve every observed or missing condition and produce a
new report against condition-labeled historical references. A cap stop remains a
censored result, not permission to adjust the budget and restart. No automatic
Learning behavior is mixed into that comparison.
