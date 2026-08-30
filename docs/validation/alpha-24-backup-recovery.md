# Alpha.24 backup and recovery validation

- Feature revision: `ffba88a`
- Date: 2026-08-30
- Result: passed with retained Phase 4A limits
- Environment: macOS, local Node.js, fresh detached Git worktree

## Scope

This validation covers the Alpha.24 local recovery mechanism for project-owned Temple organization state. It does not cover a complete application repository, application data, an external system, or remote disaster recovery.

## Independent reproduction

Independent QA created a fresh detached worktree at exact revision `ffba88a`, shared the already installed local dependency directory by symlink without copying current-worktree project source, and ran:

```bash
npm run verify
```

Observed result:

- repository checks passed;
- documentation link checks passed;
- 148 tests passed;
- 0 tests failed, skipped, cancelled, or remained todo;
- the temporary worktree was removed after verification.

## Behaviors demonstrated

- Project-owned backup selection includes the lock, project identity and state, artifacts, learning, events, and project Skills while excluding generated views, managed framework content, and application source.
- Backup creation verifies its staged payload before publication; inspection rejects unsafe paths, unsupported schemas, duplicates, ordering drift, missing and extra files, symbolic links, excessive declared size, mode drift, checksum drift, and identity or installed-version inconsistency.
- Restore preview is read-only, reports create/replace/identical actions and preserved extras, and binds apply to a content-derived digest that becomes stale after target change.
- Apply refuses unapproved replacement, uses durable before-images and an external ledger, and never deletes target-only files.
- A separately initialized same-version checkout reproduces all backed-up file digests, rebuilds generated status, and passes Doctor.
- An internally consistent older backup returns `upgrade_required=true` and proceeds through the existing checksum-safe upgrade path.
- Ordinary failure rolls back immediately; interruption before commit rolls back through `restore recover`; interruption after the durable commit finalizes without undoing success; a later human edit blocks rollback instead of being overwritten.

## Retained evidence

The following remain required before Phase 4A can close:

- recover one real data-bearing project checkout in a clean environment;
- rehearse a real forward migration and documented rollback;
- exercise broader operating-system, real power-loss, and machine-loss conditions;
- define any remote retention, encryption, audit-export, or organizational disaster-recovery policy separately.

This record supports a local alpha recovery claim only.
