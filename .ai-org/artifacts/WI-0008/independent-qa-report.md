# WI-0008 Independent QA Report

- Position: Independent QA
- Agent Identity: Lulu
- Candidate revision: `0e9891cfe4d9d92881e8614b6eaf75ccdbc1bcc6`
- Result: pass with retained limits

## Independent setup

Independent QA did not reuse the Developer's restored checkout or backup. It created a fresh detached Temple worktree at the exact candidate revision, a fresh detached AiPet worktree at `28d53b483d0e5c5a21d9b483221393c3dd83ef77`, and a new external backup.

The Temple candidate passed `npm ci --ignore-scripts --no-audit --no-fund` followed by `npm run verify`: 148 tests passed and none failed. Repository policy and documentation-link checks also passed.

## Reproduction

- The new backup contained 21 files and 30,945 bytes.
- Its content digest was `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68`, matching the Developer rehearsal. Its manifest digest differed as expected because the manifest records a new creation time.
- The initial restore plan digest was `6610b8e804c767194422d84a5dea980142707318b3fe78d29a4bd741cd3a00bb` and reported 21 identical files with `upgrade_required=true`.
- Independent QA changed one Agent display name and removed one backed-up evidence file only in the isolated fixture.
- Applying the initial plan exited non-zero with `Restore preview is stale; run restore preview again`.
- The refreshed plan digest was `9e1c53d099f34b16b9ca8388a28c0e4a5a59f5498732691ad24ea21e9251616a`; it reported one create, 19 identical files, one replace, no extras, no conflicts, and `upgrade_required=true`.
- Restore transaction `2026-08-30T05-01-08-996Z-a1263133-11b1-4e52-aaad-1f78feef77f5` completed with no cleanup warning.
- All 21 restored payload digests matched the new backup before upgrade.
- The isolated checkout upgraded from Alpha.5 to Alpha.24.
- Post-upgrade Doctor passed 36 checks with no warning or failure. Status reported project `aipet`, Temple Alpha.24, one completed Work Item, and no attention signal.
- The primary AiPet checkout remained clean at its original revision.

## Decision

The candidate independently reproduces the bounded claims in `docs/validation/alpha-24-aipet-recovery.md`. It may proceed to Release Gate as a local framework validation record.

The result does not prove post-upgrade rollback, real process interruption between writes, large or cross-machine backup, remote transport, application-data recovery, regulated retention, or production disaster recovery. It does not authorize any AiPet feature, merge, release, or production action.
