# WI-0198 independent outcome review

## Decision

**Changes required.**

This review covers the retained live outcome and interpretation at exact candidate `8e1d5ed8f8242370eafa79db22c07f2d5b4a4f94`. It performed no model call, retry, fallback, reset, Credit purchase, automatic top-up, or implementation change.

Reviewer: Quality Evaluator `agent-lulu` (Lulu), runtime `/root/wi0198_outcome_qa`. The outcome candidate was handed off by Developer `agent-rikku`; the identities are distinct.

## Confirmed evidence

- The canonical object digest of the retained seal is `2e3817ebedce79b7a5743ec9e1533f8e4dd6f49dc8a9320144a83d83505b69fe`.
- The byte SHA-256 values recorded in the durable observation match the temporary sanitized files: `37fc233f4feebc976fc2f3d7b707326cae4978960096784715cb1e5064bd63b6` for `results.json` and `d302b1b9d0db4b98d9d32c3cf34d17970a6262d2dbafc1c0d39caf1f857fbd8d` for `result-1.json`.
- The exact candidate's normalized observation matches the retained result for the case and arm, requested model and effort, planned and recorded counts, compatibility result, stop label, wall measurements, child counts, parent terminal state, tool count, Token fields, conservative counter, cleanup state, final path snapshots, automatic grade, and retention flags.
- The observed measurements are: zero children where one was expected; 46,628 ms overall and 46,528 ms subject elapsed time; 33,472 parent Operational Tokens; 129,728 parent total Tokens, including 96,256 cached input Tokens. Usage is explicitly last-observed per-thread telemetry and is not account-final cost evidence.
- The normalized stop `native-helper-unobserved` is correctly derived from an incomplete trace with one expected child and zero observed children. It is a symptom classification, not a machine-confirmed Provider failure category.
- Cleanup is recorded as `observed-terminal`, with zero unfinished observed actors. The final fixture snapshot reports zero changed paths and zero out-of-scope paths.
- The sanitized result retains neither raw tool output nor hidden reasoning. It contains no raw command, aggregated command output, prompt field, fixture/source absolute path, user-home path, or macOS temporary-directory path.
- The approval binds the same seal, `gpt-5.6-terra`, `medium`, one arm, at most one child and two subject turns, zero retries and fallback, and no reset, Credit purchase, or automatic top-up. The recorded run started before the approval expired.

## Required corrections

1. `live-report.md` and `live-observation.json` present the parent's statement that native dispatch failed before child creation as an independently established fact. The retained machine evidence has `native_errors: []` and `event_journal.first_failure: null`; it directly establishes only that no candidate child was observed. Attribute the dispatch-failure statement to the parent and distinguish it from observer evidence.
2. Replace the causal statement that the result narrows the remaining problem to the dispatch boundary. The evidence narrows the observed symptom to **before child acquisition**, but cannot establish whether dispatch was attempted, rejected, unavailable, or otherwise not observed. Binding and replay were not exercised, but the root boundary remains unknown.
3. Qualify `no files changed` as a final-snapshot result. `changed_paths` and `out_of_scope_paths` are empty, but `case_grade.facts.transient_shell_writes_proven_absent` is `false`; absence of transient writes is not established.
4. Restore mandatory repository verification. `npm run verify` stopped in `npm run check` because `.ai-org/artifacts/WI-0197/live-approval.md` contains CJK text in non-localized documentation. Preserve the historical approval provenance while resolving the repository policy failure, then rerun the full verification command.

## Generation-free validation

```text
Exact normalized-field and digest comparison: passed
Privacy and bounded-retention scan: passed
node --test .ai-org/artifacts/WI-0197/runner.test.mjs .ai-org/artifacts/WI-0196/events.test.mjs
28 passed, 0 failed

npm run verify
failed during npm run check
Repository checks failed:
- .ai-org/artifacts/WI-0197/live-approval.md contains CJK text; non-localized documentation must use English
```

The full test suite did not run after the repository check failure, so no full-suite passing claim is made for this candidate.

## Unresolved facts

- Whether a native helper dispatch was actually attempted and rejected is not directly retained.
- The cause of the missing child is unknown; runtime capacity, Provider support, request semantics, tool availability, and other pre-acquisition conditions remain possibilities rather than findings.
- Absence of transient filesystem writes is not proven.
- Provider usage finality and account-billing equivalence remain unestablished.

No rerun or broader compatibility claim is authorized by this review.
