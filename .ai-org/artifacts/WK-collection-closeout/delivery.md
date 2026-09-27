# Collection closeout delivery

## Changes

- Existing delivery check: native task state and acceptance are separate from
  declared source collection and required metric completeness.
- Existing receipts: independent usage, activity and collector timestamps, with
  an explicit later-usage indicator that never extends recorded activity.
- Existing Markdown report: collection summary, per-operation cutoffs and a
  consolidated follow-up list. No source discovery, collection or task mutation.
- Daily-work guidance: small coupled implementation stays with the coordinator;
  one actual distinct reviewer remains. Prepare evidence before final verification,
  preserve pinned snapshots and collect late rows through the existing binding.

## Verification protocol

Focused regression: 28 tests passed. The first editing run exposed an invalid
new fixture missing required cumulative token counters; the fixture was corrected.
The passing tests cover accepted tasks with pending sources, missing metrics,
measured zero, late token observations, interrupted outcomes, explicit collection
stops, mismatched bindings, unavailable/corrupt sources and read-only reporting.

Full verification is recorded separately in verification-full.txt on the committed
behavioral candidate. Independent review is recorded by the reviewer in review.md
and the native lifecycle. This document does not itself certify either gate.

## Skills and boundaries

Applied workkeel-work: native claim, exact-candidate handoff, distinct actual
review and authorized local acceptance. Used existing execution capture and
delivery tools; expected.json identifies the three declared operations. Pure
program verification reports zero model tokens and its own interval. The main
operation includes implementation and coordination; it is not pure overhead.

Activity starts at explicit capture, so setup before capture remains unmeasured.
Source collection can remain pending until this conversation turn ends. Follow-up
snapshots must preserve that gap and earlier evidence bytes. No end-to-end savings
claim can be established from this single change or these regression fixtures.
No UI change, deployment, merge, publication or new benchmark is included.
