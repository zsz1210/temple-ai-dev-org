# Alpha.33 candidate qualification

User authorized the recommended next Alpha preparation and upgrade verification.
The bounded result is a reviewed, integrated candidate with retained package bytes;
it does not publish a Release or modify any real downstream project.

## Scope and acceptance

- Align package/lock/constants and self-host bootstrap at 0.1.0-alpha.33.
- Explain merged field-remediation and verification-performance changes without
  claiming general Token savings, production maturity or full team qualification.
- Qualify a frozen candidate with Node.js 24, lockfile installation, full verification,
  package allowlist, dependency audit, clean consumer and Alpha.32 upgrade checks.
- Use the published Alpha.32 archive as baseline. Retain version, integrity and
  candidate Git revision. Preserve every pre-existing project-owned fixture file
  byte-for-byte on upgrade, including organization state, application files and
  custom native instructions. Check managed-file conflicts are not overwritten.
- Separate Developer Rikku from Independent QA Lulu; reuse full measurements with
  independent review rather than automatically duplicating the full suite.

## Design and risk

No new framework behavior is intended. Update version files with apply_patch.
During the version bump only, the old pinned self-host launcher rejects the new
repository version. Use the exact repository-local bin/temple.mjs upgrade
implementation, first dry-run then apply, to refresh the lock and checksum-clean
managed files, as documented by WI-0163. Return immediately to templew for lifecycle
operations. No global or unpinned network CLI is substituted.

Release documents target maintainers and adopters, in the repository's canonical
English. Existing language entry points remain unchanged. Readiness separates
published Alpha.32 from prepared Alpha.33; service channel observations are dated.
Historical Alpha.30 evidence remains linked, not presented as current verification.

Disposable fixture Agent labels Rowan/Mira/Theo/Devon/Quinn are test data only.
The harness uses owned temporary directories, the exact source dependency lock,
bounded subprocesses and finally cleanup; it never opens a real project. Archive
results contain relative labels and counts, not machine paths or credentials.

## Observable stop and rollback

Stop after exact-candidate evidence, independent judgment and ordinary PR integration.
Keep the candidate tarball locally for a deliberate later publication decision.
No tag publication, npm upload, downstream migration, paid experiment or announcement.
Before publication, abandon or supersede the candidate without registry mutation;
revert the reviewed source change through a normal PR if required. Published versions
are immutable and would require a separately authorized successor, not replacement.

## Initial recovery

An initial create request used a documentation path as --context-ref. The empty
context-map rejected it before mutation; no Work Item existed. The corrected request
omitted the nonexistent route and retained the release procedure here as evidence.

## Qualification corrections before the final candidate

The package-boundary check rejected the one added public guide (444 versus 443
reviewed entries). scripts/check-package.mjs is additionally affected: require
that exact guide and raise only the count to 444; retain all forbidden paths and
size limits. This is necessary package qualification work within the approved
scope. No other active Work Item overlaps this check file. The CLI has no supported
affected-path update operation; retain the precise addition here rather than
manually rewriting the canonical Work Item.

The first disposable harness attempt incorrectly treated generated view timestamps
and lock integration receipts as project data. Its recorded failure is retained.
Repeat-init verification now checks all other bytes and separately compares the
lock while allowing only validated installed/appended-to-present native integration
receipts to refresh. Subsequent attempts exposed those documented receipt values
and are also retained. The installation timestamp remains checked. No runtime
implementation changed.
