# WI-0175 — Configure option validation

## Approved outcome

The user accepted the proposed narrow CLI correction. Reject options that `work-item configure` does not consume, before target access, locking, canonical writes or view refresh. Preserve every currently supported option. Do not implement scope-path editing, redesign the global parser, run model experiments, publish, merge or clean up unrelated processes.

## Acceptance and design

- Add a dispatcher-local allowlist matching configure's consumed value options and boolean flags, following the existing rework guard.
- Unknown global options retain the parser error. Globally recognized but unsupported configure options identify the offending option and command, with a help hint.
- Regression checks cover the reported `--affected-path`, other value options, misleading `--dry-run`/`--no-write`, mixed valid/invalid requests, and failure before target access.
- Compare the complete fixture file tree, including canonical events and generated views, before and after failures.
- Keep JSON/text success, document-reference clearing, coordination fields, and global help compatible. Run focused tests, full verification and a separate Independent QA check against an exact commit.

## Ownership and risk

Mog coordinates; Yuna owns scope; Tidus owns design; Rikku implements; Lulu independently checks the candidate. No UI change. Standard reversible bug fix; rollback is reverting the implementation commit without rewriting history. Another task owns comparison diagnostics and has been notified of WI-0175 and the narrow shared dispatcher edit. Its historical Work Item collisions must be reconciled separately; neither history is overwritten here.

## Stop

Stop after local verified candidate and organizational closeout; report remaining integration explicitly.
