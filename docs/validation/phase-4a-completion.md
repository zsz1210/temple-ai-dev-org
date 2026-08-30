# Phase 4A durability operations — Developer completion record

- Work Item: `WI-0016`
- Date: 2026-08-30
- Status: Developer implementation complete; integration and Independent QA pending
- Revision: the commit containing this record on `phase4/wi-0016`
- Environment: local macOS, Node.js, disposable test directories

## Scope completed in this worker branch

This bounded slice adds deterministic backup-set inspection and retention planning/apply APIs, a versioned audit-export module, focused automated evidence, an operator contract, and disposable-copy rollback and interruption rehearsals.

It does not wire shared CLI commands, change schemas or package versions, update installation or upgrade registries, mutate the canonical Work Item, or perform external actions. Those shared integration changes belong to the Integration Owner.

## Implemented contracts

### Backup-set retention

- The caller must supply an existing real backup root outside the project.
- Every direct child is validated as a complete, checksum-consistent Temple backup.
- Inspection and retention decisions are deterministic and content-digested.
- At least one newest target-project backup is preserved; callers may choose a larger minimum and explicit named preserves.
- Backups for other projects are never retention deletion candidates.
- Apply requires both the reviewed plan digest and explicit deletion consent.
- A changed backup set makes the plan stale and fails closed.
- Every deletion is preflighted again before any mutation.
- Traversal, unsafe names, symbolic links, special/non-directory entries, and roots nested with the project are refused.
- A partial deletion failure stops the operation, reports completed and remaining names, and requires a new plan.

### Audit export

- `temple.audit-export/v1` is deterministic and includes a content-derived digest.
- Canonical events are streamed, validated, filtered, and bounded to the latest matching records while preserving source order.
- Event fields are projected through a fixed token-like allow-list; free-form scalar text, arbitrary metadata, and nested bodies are not exported.
- Redaction is recursively reapplied; safe references are bounded, absolute/traversal paths are redacted, and HTTP(S) references lose credentials, query strings, and fragments.
- Recovery data is projected only as bounded transaction metadata and counts.
- Prompts, responses, hidden reasoning, credentials, runtime secrets, provider bodies, command output, tool inputs/results, before-images, per-file recovery paths, and recovery failure bodies are excluded.
- Output requires an explicit new path and does not overwrite an existing file.

### Disposable recovery rehearsal

The automated rehearsal copies a synthetic data-bearing project into separate pre-upgrade, forward-upgrade, rollback, and interruption targets. It upgrades only the forward copy, restores the pre-upgrade backup into a version-compatible rollback copy, recovers an interrupted restore on another copy, and proves the primary fixture remains unchanged.

## Developer verification

Focused command:

```bash
node --test test/recovery.test.mjs test/audit-export.test.mjs
```

Observed result:

- 18 tests passed;
- 0 failed, skipped, cancelled, or remained todo;
- retention ordering/preservation, stale digest refusal, consent, traversal/link/special-file boundaries, partial failure, audit leakage/bounds/determinism, exclusive output creation, disposable rollback, and interruption recovery were exercised.

Repository-wide command:

```bash
npm run verify
```

Observed result on this worker branch:

- repository and documentation-link checks passed;
- 173 tests passed;
- 0 failed, skipped, cancelled, or remained todo.

Repository-wide verification must be rerun against the final integrated revision. This Developer record is not Independent QA evidence.

## Retained limits

- Shared CLI routing, help text, installed-file registration, package/version changes, and validation-index updates are not part of this worker branch.
- The retention engine manages only explicit local backup roots. It does not schedule backups, choose an organizational retention policy, encrypt data, upload data, or coordinate remote deletion.
- Audit export summarizes only canonical repository events and local recovery metadata. It is not a compliance archive, provider log export, or cryptographic attestation service.
- The rollback and interruption evidence uses synthetic disposable copies on one local machine. It does not claim real power loss, filesystem corruption, cross-machine recovery, remote transport, production data, or production readiness.
- Real-project post-upgrade rollback, broader operating-system coverage, and Independent QA remain required before closing Phase 4A.

The supported claim is a locally Developer-verified Phase 4A module slice with retained operational limits.
