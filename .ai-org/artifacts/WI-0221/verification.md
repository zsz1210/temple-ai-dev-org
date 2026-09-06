# WI-0221 developer verification

## Delivered

Added experiment-only bounded command observations to the existing event record.
No new model run, model selection, command allowance, default-format change,
dependency or release. No original prompts, test names, errors, stack traces,
source paths or bodies are retained by the new observation fields.

- Recognizes bounded Node TAP and spec failures: keyed label ID and an allowlisted
  error class; unsupported, partial and oversized reports remain explicit.
- Fingerprints the fixture implementation, two test files and package file at
  test-command boundaries. Missing/oversized/symlink inputs remain unavailable.
- Matches whole literal cat output and emitted context bodies to bounded local
  snapshots. Records keyed source/content IDs, bytes and whole range; marks first,
  repeated same-content or changed-since-last-read within one actor stage.
- Null/reused context rows do not count as new exposure. New Verifiers start with
  a fresh overlap map. Glob/numbered cat and unmatched output remain unknown;
  other range/search/list commands are not measured by this initial observer.
- Adds source-digest bindings so future approvals cannot silently reuse the old
  instrument. The old WI-0220 seal still verifies and no old lab was modified.

## Actual local results

- New observer suite: 10/10, including real Node TAP/spec subprocess output and a
  fake-provider event integration (zero model calls).
- Observer, command-policy, format and material suites together: 44/44.
- Final `npm run verify`: 676/676, zero failures, skips or cancellations;
  157071.023375 ms. Repository, documentation-link and package checks passed.
- `git diff --check`: passed.
- `context-format-comparison.mjs verify-seal` on retained WI-0220: passed.

An initial local run correctly exposed unsupported spec reporter output; support
was added and checked against actual Node output. The first full regression then
identified a Buffer-key compatibility bug: existing harness tests use a Buffer,
while the new observer initially accepted strings only. It now accepts both,
the focused fixture uses a Buffer, and the complete suite passed again. These
were local development failures, not live model experiment attempts.

## Interpretation and remaining limits

This is bounded diagnostic metadata, not an authority or quality judgment.
Hashing a test label does not create a globally unique test ID; identical labels
can collide semantically. Error classes alone do not establish root cause.
Boundary snapshots cannot prove the exact inputs throughout a concurrent command.
Matching whole output establishes observed exposure, not reading comprehension,
permission to skip required context, or redundant/wasted inference.

The initial implementation caps inspection at 256 KiB per file/output, 16 source
rows and 16 failures, and 256 started/completed command observations per stage.
It does not infer missing data as zero. It adds bounded local reads; no claim of
zero overhead or measured end-to-end savings is made. No raw-output archive,
general repository scan, background daemon or provider call was introduced.

Developer verification is complete. Independent QA and integration remain separate;
the previous approval covered PRs 65-69, not this new change.
