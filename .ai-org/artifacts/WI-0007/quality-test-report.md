# WI-0007 Quality test report

- Position: Quality & Evaluation Engineer
- Agent Identity: Lulu (`agent-lulu`)
- Candidate revision: `ffba88a`
- Result: pass with retained Phase 4A limits
- Evaluated at: 2026-08-30

## Reproduced evidence

1. Confirmed that `src/`, `test/`, `docs/`, package metadata, changelog, and `temple.lock` in the working checkout have no content difference from candidate revision `ffba88a`.
2. Ran `node --test test/recovery.test.mjs test/cli.test.mjs`: 32 passed, 0 failed.
3. Ran `npm run check`: repository checks and documentation link checks passed.
4. The pre-handoff full `npm run verify` run against the content committed as `ffba88a` passed 148 tests with 0 failures.

## Behavior evaluated

- Backup ownership boundaries and exclusion of generated, managed, and application files.
- Manifest ordering, path safety, identity and installed-version consistency, modes, sizes, payload set, and SHA-256 verification.
- Mandatory read-only restore preview, deterministic stale-plan rejection, explicit replacement consent, and target-only preservation.
- Same-version recovery into a separately initialized checkout followed by generated-view rebuild and Doctor.
- Ordinary error rollback, pre-commit interruption rollback, durable post-commit finalization, and refusal to overwrite a later human change.
- Internally consistent older-version restore followed by checksum-safe upgrade.
- CLI behavior, capability metadata, version bump, documentation links, and public claim boundaries.

## Retained limits

- The data-bearing clean-checkout exercise is an isolated local fixture, not yet the retained real-project Phase 4A exit validation.
- Remote hosting, encryption, schedules, complete repository or application-data backup, distributed transactions, and production disaster recovery are not delivered.
- Broader operating-system, real power-loss, migration rollback, and machine-loss validation remain open.
