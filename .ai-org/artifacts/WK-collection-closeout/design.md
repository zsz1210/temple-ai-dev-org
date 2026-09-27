# Collection closeout design

## Evidence and scope

The read-only real-task phase analysis found that the coordinator's recorded
usage represented 64.9% of input plus output across four recent tasks. It includes
implementation as well as coordination; it is not an overhead estimate. Several
token snapshots advanced after activity clocks stopped, and one completed task
still had a running usage source. These observations justify clearer closeout
reporting, not a claim that this change reduces total time or tokens.

## Change

Extend the existing delivery receipt with collection status and three independent
timestamps: last usage observation, last recorded activity interval end, and last
collection. Distinguish pending collection, observed terminal collection, explicit
collection stop and unavailable sources. Completion of collection does not imply
successful execution or complete metrics. A timestamp comparison is an observation
about recording cutoffs, not proof of work performed after the activity clock.

The expected-operation check exposes native task state and local acceptance
independently of report completeness, plus a compact per-operation follow-up list.
The existing Markdown report presents these fields without collecting a source or
writing task state. Preserve current completeness checks, unknown values, measured
zero, explicit binding boundaries, privacy and validation guards.

## Delivery

One coordinator implements these coupled helper, test and documentation changes.
One distinct reviewer inspects the exact candidate and records its own judgment.
Prepare stable delivery documents before full verification. Generate measurement
snapshots from existing receipts when needed; do not rewrite accepted evidence to
incorporate late token rows. Pending collection is explicit, with a later read-only
check of the same binding. No new workflow service or model call is introduced.
