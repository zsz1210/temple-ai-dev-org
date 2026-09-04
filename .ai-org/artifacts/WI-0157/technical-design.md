# WI-0157 Technical Design

## CLI guidance

Keep the global help compact, but make the `temple close` usage line enumerate the four Standard release-gate `--satisfy` keys. The detailed getting-started guide remains the explanatory source.

## Repository artifact validation

Add one validation pass beside normalized Evidence validation in `src/work-items.mjs` and invoke it before any Work Item or event write in both transition and closeout.

A reference is treated as a repository artifact when it is not an `EVID-...` ID or URL and either contains a path separator or ends in a conventional file extension. Such a reference must:

- be a normalized safe repository-relative path;
- resolve inside the repository;
- exist as a regular file;
- not be a symbolic link.

Bare exact Git revisions, `not-required`, and natural-language blocker, cancellation, approval, or result text remain literals. Normalized Evidence validation remains authoritative for `EVID-...` references.

## Read-only reproduction and erratum

Test generated Capability Registry bytes before and after Doctor and `status --no-write`. Also confirm that ordinary `status` is the intentional generated-view writer. Record the already reproduced QueueKeep before/after Doctor SHA-256 equality in a new erratum and link it from the validation index. Do not edit content-addressed WI-0156 artifacts.

## Verification

Focused CLI and workflow tests run first. The exact candidate then runs the complete repository gate in an isolated checkout for Independent QA. No model generation is needed to verify these deterministic behaviors.
