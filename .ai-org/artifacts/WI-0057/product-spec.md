# Product specification: telemetry append serialization

## Problem

`openTelemetryJournal.append` reads the last in-memory cursor before its first asynchronous durable write. Concurrent calls can therefore allocate the same next cursor and write a journal that later fails the strict-increasing integrity check.

## Acceptance

- A concurrent burst of unique events returns consecutive unique cursors in call order and reopens successfully from disk.
- Concurrent calls for one stable identity write one record and return one duplicate result.
- One failed mutation does not poison later queued mutations.
- `close` waits for accepted writes and append after close fails explicitly.
- Existing journal privacy, compaction, checkpoint, replay, and lease behavior remain passing.

## Non-goals

This change does not provide a distributed lock, coordinate multiple journal instances, repair old invalid journals, change Token attribution, or alter Provider generation.

