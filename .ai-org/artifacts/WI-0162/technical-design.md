# WI-0162 Technical Design

## Retained-artifact normalization

`temple publication artifact-plan` scans only Git-tracked regular text files below `.ai-org/artifacts/`. It replaces the same three local-environment shapes as canonical normalization in memory and reports only paths, rule counts, before/after SHA-256 digests, the current Git revision, and one deterministic plan digest. It does not scan or change binaries, untracked files, canonical Work Items, project registries, source code, or Git history.

`temple publication artifact-apply` requires an active claimed Work Item, the exact plan digest, and explicit confirmation. It recomputes the plan, refuses stale input, snapshots every candidate, writes atomically, validates changed JSON and JavaScript, appends one value-redacted event, and restores all writes if any validation or event write fails. Re-running the plan after success must return `no-changes`.

The plan also lists active evidence records whose current artifact digests would be changed. Apply fails closed while any such record remains active. The operator must explicitly invalidate it or record a same-Work-Item replacement through the Evidence CLI first, so privacy cleanup cannot silently corrupt the evidence registry.

The reviewed plan and apply result are retained under the governing Work Item. Together they preserve current-tree provenance without copying the matched values.

## First-party fixtures

Temple-owned tests continue to create realistic private paths, IPv4 addresses, and Tailnet hostnames at runtime, but build them from semantic components instead of storing audit-shaped literals in tracked source. Assertions continue to exercise the original security and redaction behavior.

## Provenance-bound adapter fixture disposition

An Evidence Profile may declare `reviewed_adapter_fixtures`. Each entry binds one repository-only local-environment finding to:

- a safe adapter-relative source path;
- the exact line, rule, and occurrence count;
- the file's SHA-256 digest;
- the installed adapter manifest that records the same path and digest; and
- a human approver, timestamp, and rationale.

The audit treats the occurrence as `allowed / reviewed-adapter-fixture` only when all of those facts match. Missing files, changed bytes, mismatched manifests, unsafe paths, unsupported rules, excess occurrences, or invalid policy are blockers. The mechanism cannot apply to packages, credentials, local-only data, inspection failures, binaries, or arbitrary first-party paths.

This avoids patching Archify's pinned source while making the reviewed decision machine-checkable. Adapter status must continue to prove the installed source is byte-for-byte identical to its pinned manifest.

## Final audit contract

The public audit may still return `review-required` because tracked binaries are deliberately outside text inspection. The text requirement is stricter: zero blocked text findings and zero review-required text findings. The report exposes the count of allowed reviewed adapter fixtures separately.

No successful plan, apply, audit, or verification result authorizes publication.
