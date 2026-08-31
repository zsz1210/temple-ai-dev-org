# Technical design: Bounded archive-aware usage projection

## Data path

`readUsageTelemetryHistory` receives the active journal records and resolved local state directory. It discovers direct timestamp-named archive entries, applies file-count and byte limits, reads only lines advertising the exact normalized usage event type, validates them, and creates a strict usage-only projection.

The function merges active and archived projections by Provider event identity (`source` + NUL + `id`). Identical events are deduplicated. Any identity with non-equivalent data is quarantined from the aggregate and counted as a conflict. Final records are ordered by observation time, event time, source, and ID; archive cursor order is deliberately irrelevant.

Each parsed archive is cached by its resolved path, device/inode identity, size, modification/change timestamps, project ID, and read limit. Active records are remerged on every snapshot, so live usage remains current without rereading multi-megabyte immutable archives on every SSE refresh.

## Minimal retained schema

The in-memory historical projection keeps:

- CloudEvent version, ID, source, type, subject, time, and observation time;
- the local cursor only as non-authoritative record metadata;
- project, Work Item, task, scope revision, and existing usage dimensions;
- non-negative numeric Token fields and model context window.

It drops all arbitrary event data. Prompt, content, instruction, response, message, command, tool arguments, tool results, hidden reasoning, credentials, and unknown fields cannot flow into the usage aggregate or Dashboard.

## Diagnostics

`usage.source.history` reports a bounded summary:

- coverage status (`complete`, `partial`, or `active-only`);
- active and archived observations accepted;
- discovered, scanned, accepted, and skipped archive counts;
- duplicates removed and conflicting identities excluded;
- sanitized warning codes and archive basenames only.

Diagnostics never include event bodies, parser input, credentials, or absolute filesystem paths.

## Failure behavior

- Unsafe file type, file-size limit, total-byte limit, read failure, or invalid matching usage record: exclude that archive and mark coverage partial.
- Identity conflict: exclude every record carrying the conflicting identity and mark coverage partial.
- Invalid active usage record: exclude that record and mark coverage partial; valid active events remain available.
- No archive directory: preserve current active-only behavior.

## UI integration

The existing Usage renderer consumes the history summary. A complete archive inclusion produces a concise restored-history note; partial coverage produces a warning. Totals, driver cards, unknown dimensions, qualification, cost, and routing rules remain unchanged.

## Verification

- Unit tests cover discovery bounds, symlink rejection, malformed matching records, non-increasing archive cursors, strict field projection, deduplication, and conflict quarantine.
- Control Plane tests prove rebuild preserves a Provider-only usage event in the subsequent snapshot without copying it into the active event stream.
- Full repository verification runs on the exact candidate.
- Independent QA repeats verification in a fresh detached worktree and checks the preserved local archive by digest without modifying it.
- Browser review proves the live Usage view presents the restored `WI-0056` evidence at wide and tablet widths.

## Risk review

- Privacy risk is reduced by strict projection and bounded diagnostics.
- Integrity risk is reduced by conflict quarantine and per-file failure isolation.
- Availability risk is reduced by archive cache and active-data fallback.
- Archive mutation risk is eliminated because the feature opens archives read-only and never writes beneath `archive/`.
- Rollback is a code revert followed by Control Plane restart; archived evidence remains unchanged.
