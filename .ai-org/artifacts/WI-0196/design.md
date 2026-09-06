# WI-0196 two-phase native child acquisition

## Problem

WI-0195 observed a real Codex parent `subAgentActivity` item and child-thread events without the parent `collabAgentToolCall` spawn-completion envelope used by WI-0194 as the only binding proof. The recorder correctly quarantined those observations, but it could not subscribe to the child, prove the sealed route, or measure the helper.

## Boundary

This is a generation-free successor implementation. It does not modify or reinterpret WI-0194 or WI-0195, call a model, spend Credits, publish, merge, or authorize a new live experiment.

## Acquisition state machine

1. A schema-valid parent `subAgentActivity` item contributes one bounded candidate child ID.
2. Events for that ID remain quarantined and do not affect messages, commands, terminal state, or usage.
3. The executor attempts `thread/resume` once for the candidate.
4. The response must return the same thread ID, the sealed model, and the sealed reasoning effort. A missing or `null` effort is unconfirmed, not a match.
5. Only after those checks does the tracker bind the child with acquisition basis `activity-resume` and replay its buffered events.
6. A later valid parent spawn-completion envelope may corroborate the same child once. It cannot create another actor or replay events twice.

The existing spawn-completion path remains supported and records acquisition basis `spawn-completion`. Activity is navigation to a verification attempt, never identity, authority, lifecycle, or usage evidence by itself.

## Failure semantics

The first failure remains authoritative. Resume failure, child-ID mismatch, model mismatch, missing effort, effort mismatch, candidate overflow, a foreign or nested spawn, duplicate spawn confirmation, helper writes, usage inconsistency or regression, and cleanup uncertainty have fixed stop codes. An unverified candidate remains unbound in the report. Executor results expose the allowlisted event-contract codes at top level; unknown tracker exceptions collapse to `event-contract-violation`.

## Limits and privacy

- At most the protocol's `maxChildren` candidate IDs may exist.
- At most 64 unbound events are retained.
- Candidate and actor IDs are emitted only as SHA-256 digests.
- Each candidate is resumed at most once.
- Parent/child Token aggregation remains `null` until non-duplication is established independently.
- Existing bounded answer/message and raw-output rules remain unchanged.

## Verification

Tests use a fake JSON-RPC Provider and the installed App Server schemas. They cover quarantine, exact resume binding, early-event replay, route mismatches, resume failure, candidate bounds, late spawn corroboration, duplicate spawn rejection, helper-write rejection, cleanup uncertainty, and conservative usage aggregation. SHA-256 fixtures assert that sealed WI-0194 and WI-0195 inputs do not change.
