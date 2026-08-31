# Technical design — WI-0061 approval boundary

## Design decision

WI-0061 ends after recording the approved experiment contract. It does not launch the Provider or mutate the synthetic repository. Execution is represented by a new Work Item so the approval decision, live attempt, evidence, and terminal classification remain independently auditable.

The execution Work Item must:

1. use the existing approved path without deleting or overwriting the retained WI-0051 pilot history;
2. create exactly one new synthetic Work Item for this attempt;
3. validate the installed Codex App Server contract and Provider readiness before the launch boundary;
4. use `gpt-5.6-luna` with `max` reasoning, one launch attempt, one turn, and no retry;
5. retain only bounded identifiers, statuses, numeric usage, timing, provenance, and repository-diff evidence;
6. stop on every limit or authority boundary in `pilot-proposal.md`;
7. preserve the synthetic repository for human review and require separate authorization for cleanup.

## Risk review

- The approved path already contains the retained WI-0051 experiment. The new attempt must add one Work Item without removing, resetting, or rewriting that history.
- Provider Token telemetry is reactive. A reported value may arrive after usage has occurred, so the turn/attempt count and zero-retry boundary are the enforceable pre-launch limits.
- The signed-in Codex entitlement may be consumed; no monetary billing conclusion is permitted.
- Any protocol drift, missing correlation, external credential requirement, or model mismatch fails closed without retry.

## Verification

WI-0061 verification checks that the approval artifact, proposal, planning document, and Work Item state agree. It does not call a model or claim that the pilot succeeded.

## Rollback

Revert the approval-record commit and leave the execution Work Item unstarted. Do not delete the retained synthetic repository or any Provider thread automatically.
