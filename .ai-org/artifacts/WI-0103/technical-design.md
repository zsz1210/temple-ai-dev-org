# WI-0103 technical design

## Change shape

This is an evidence-reconciliation change, not a new runtime feature. It adds one durable Wave 2 record, links it from the validation index, and updates the cross-scenario plan status.

## Evidence precedence

For each behavior, use the strongest qualifying source while retaining weaker evidence when it explains a boundary:

1. retained live project execution;
2. exact-revision automated implementation verification;
3. controlled local simulation;
4. planned or not-run scope.

The record will not aggregate these into a numeric score. Different evidence classes answer different questions and cannot be averaged honestly.

## Planned matrix

The matrix will cover:

- repository-backed Position handoffs;
- live isolated parallel workers and candidate revisions;
- integration-owner join and dependent-wave replanning;
- affected-path overlap and deterministic capacity scheduling;
- atomic claim/resource/worker preparation and rollback;
- stale-plan rejection and clean-source recovery;
- actual shared Simulator contention and safe serialization;
- competing Git writes in two disposable clones;
- real multi-human, multi-machine protected-PR operation.

## Test decision

No additional low-cost exercise is justified in this Work Item. Alpha.16 already covers path conflict, capacity, plan freshness, and tamper rejection. Alpha.17 covers atomic preparation, injected persistence rollback, correlation, resource release, and clean-source recovery. Alpha.28 covers competing Git writes through two disposable clones. IdeaDock is the stronger retained live-worker and integration-join observation.

Repeating those fixtures would add count but no new evidence class. The remaining material gap requires other humans, independently administered environments, and hosted Git controls; it belongs to the retained collaborative validation, not a local imitation.

## Verification

- Check every linked source and claim against the retained record.
- Run Markdown and repository verification on the candidate revision.
- Have Independent QA review both classification accuracy and the absence of promoted claims.

## Risk and rollback

Primary risk: overstating simulations as real organizational evidence. Mitigation: explicit evidence labels and per-row limits. Rollback is a normal revert of this documentation-only change; no runtime, schema, package, or external state is changed.
