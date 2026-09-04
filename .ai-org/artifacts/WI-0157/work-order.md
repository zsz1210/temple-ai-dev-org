# WI-0157 Work Order

## Outcome

Make lifecycle evidence references fail closed when they look like repository artifacts, make release-gate help copyable, and correct the WI-0156 generated-view attribution without rewriting sealed evidence.

## Approved scope

- Expand the `temple close` usage line with the four named `--satisfy` references required by the Standard release gate.
- Before `transition` or `close` mutates canonical state, validate references that syntactically identify repository artifacts. Reject unsafe, missing, or non-file paths. Continue accepting normalized `EVID-...` IDs, exact Git revisions, and intentional non-path reason or approval text.
- Add deterministic tests for transition and close rejection, byte-for-byte state preservation, existing compatible references, and read-only Doctor/Status behavior.
- Publish a new append-only WI-0157 erratum explaining that the QueueKeep generated-view timestamp was changed by the coordinator's `status --json` call without `--no-write`, not by Doctor or the recovery task.
- Preserve all sealed WI-0156 artifacts and their recorded digests unchanged.

## Acceptance criteria

1. CLI help shows a copyable Standard closeout command surface with `accepted_scope`, `test_evidence`, `evaluation_report`, and `independent_qa_report`.
2. A nonexistent, unsafe, directory, or symlink artifact reference cannot be recorded by transition or close, and the Work Item and event stream remain unchanged.
3. Existing `EVID-...`, Git revision, and non-path literal references retain their current behavior.
4. Hashes prove that Doctor and `status --no-write` preserve the generated Capability Registry, while ordinary `status` remains the explicit writer.
5. The erratum is indexed next to the sealed WI-0156 report without modifying that report or its content-addressed Evidence.
6. Full source verification and distinct Independent QA pass at the exact candidate.

## Risk and rollback

Risk is low but compatibility-sensitive. Over-broad path detection could reject historical literal evidence; tests must cover the existing literal and normalized forms. Roll back by reverting this Work Item's bounded CLI, lifecycle-validation, test, and erratum changes.

## Exclusions

- No change to Doctor write behavior unless the deterministic reproduction disproves the current read-only result.
- No rewrite or invalidation of sealed WI-0156 Evidence.
- No clean-room model rerun, model-routing change, public release, visibility change, npm publication, tag, purchase, reset, retry, or fallback.
