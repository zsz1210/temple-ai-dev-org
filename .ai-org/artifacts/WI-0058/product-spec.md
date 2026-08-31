# Product specification: Archive-aware Token history

## Problem

Control Plane rebuild correctly preserves an old journal as immutable local evidence and reconstructs the active journal from canonical repository events. Provider-only Token observations are not canonical repository events, so the current Usage projection loses them after rebuild even though the evidence still exists in the archive.

## User outcome

An operator opening Temple Workspace after a rebuild can still see valid historical Token totals and their Work Item, Position, lifecycle, task, and model attribution. The interface also says whether archived history was included completely or only partially.

## Functional requirements

1. Active and eligible archived usage observations are combined without writing to either source.
2. Only normalized provider usage events are projected, and only fields needed for Token analysis are retained in memory.
3. Stable Provider identity (`source` plus `id`) is the cross-journal deduplication key; cursors are never treated as globally comparable across journals.
4. Equal repeated identities count once. Conflicting repeated identities count zero and produce a bounded diagnostic.
5. Invalid, unsafe, oversized, unreadable, or over-limit archive files are skipped per file; valid active observations remain available.
6. Archive discovery and reading are bounded and deterministic.
7. The Usage projection exposes active/archive observation counts, duplicates, conflicts, skipped files, and complete/partial coverage without exposing archive bodies.
8. The existing `unknown`, qualification, cost, routing, and lifecycle-authority rules remain unchanged.

## Acceptance examples

- An active usage event and an identical archived event produce one observation.
- A valid archived event with repeated or non-increasing archive cursors remains usable because event identity, not archive cursor order, governs historical deduplication.
- Two events with the same Provider identity but different Token values are both excluded.
- A malformed usage record in one archive causes that file's usage records to be excluded, while another valid archive and the active journal remain visible.
- A symlink or non-regular archive entry is never followed.
- Extra content fields in an archived event never enter the usage projection.
- The local preserved `WI-0056` event yields `23,433` total Tokens and identifies `gpt-5.6-luna`, Developer, Build, and `WI-0056`.

## Non-goals

- Restoring raw Provider history or reconstructing a live thread.
- Repairing, rewriting, deleting, or signing archives.
- Treating archive presence as cryptographic provenance.
- Adding cost estimation, automatic routing, model switching, or another Provider call.
