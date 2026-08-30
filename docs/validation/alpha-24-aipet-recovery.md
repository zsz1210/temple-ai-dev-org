# Alpha.24 AiPet recovery and forward-upgrade rehearsal

- Status: passed with retained limits
- Date: 2026-08-30
- Work Item: `WI-0008`
- Temple source revision: `fc23facc7d8e6af99b5afc013e96a5e1b2f9a6a8`
- Phase 4A implementation revision: `ffba88afa93e1fd1a3ab86687d762b47c8939d89`
- External fixture revision: `28d53b483d0e5c5a21d9b483221393c3dd83ef77`

## Purpose

This rehearsal tested Temple's Alpha.24 backup, stale-plan protection, restore, and forward-upgrade path against a real data-bearing Temple installation from AiPet. AiPet was only a validation fixture. Its primary working tree was not upgraded or modified, and no AiPet product work was performed.

The backup covered Temple-owned organization state, not the AiPet application, Git repository, dependencies, credentials outside the included boundary, or external systems.

## Starting state

The primary AiPet checkout was clean at the recorded fixture revision and used Temple `0.1.0-alpha.5`. It contained one completed Work Item and five project-specific Agent Identities.

The Alpha.5 backup was created outside the repository and inspected before restore:

| Property | Observed value |
|---|---|
| Project ID | `aipet` |
| Source revision | `28d53b483d0e5c5a21d9b483221393c3dd83ef77` |
| Source dirty | `false` |
| Temple version | `0.1.0-alpha.5` |
| Included files | 21 |
| Included bytes | 30,945 |
| Content digest | `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68` |
| Manifest digest | `0762d74b5d1992cc5a2027b8a104f6ad89a8ff0f6eb54ac968bef7b416d2979b` |

## Rehearsal

The restore target was a clean detached Git worktree at the same AiPet revision. All mutations were restricted to that isolated checkout.

1. The initial preview reported all 21 backup files as identical and `upgrade_required=true`.
2. The fixture then changed one Agent display value and removed one backed-up evidence file.
3. Applying the original plan failed with `Restore preview is stale; run restore preview again`.
4. A fresh preview reported one create, one replace, 19 identical files, no extras, no conflicts, and `upgrade_required=true`.
5. Restore completed under transaction `2026-08-30T04-45-43-181Z-98c08c89-60f0-4181-8472-3719d718df56` with plan digest `91623edc4b4148c06ca6b8a8e37af70598d2897a6dd226644e528d5dab5cec26`.
6. A post-restore comparison checked all 21 included files, found no mismatches, and reproduced the backup content digest.
7. The isolated checkout upgraded from Alpha.5 to Alpha.24. The upgrade added 42 managed files, updated 16 managed files, preserved the project task registry, added the missing UI assignment, created the newer project-owned registries, and recorded the migration boundary.
8. Doctor passed after generated views were rebuilt.
9. The primary AiPet checkout remained clean at its original revision.

## Result

| Check | Result | Evidence |
|---|---|---|
| Backup integrity | Pass | Manifest and every included payload validated |
| Source identity | Pass | Project ID, version, exact Git revision, and clean state recorded |
| Stale-plan refusal | Pass | Pre-fault plan was rejected after target mutation |
| Explicit replacement | Pass | Fresh plan required one create and one replace |
| Canonical digest recovery | Pass | 21 of 21 included files matched the backup |
| Forward upgrade | Pass | Isolated checkout upgraded from Alpha.5 to Alpha.24 |
| Generated-state recovery | Pass | Status and capability views rebuilt under Alpha.24 |
| Post-upgrade health | Pass | Doctor: 36 pass, 0 warn, 0 fail |
| Primary checkout preservation | Pass | No primary-worktree changes or revision movement |

This evidence satisfies one Phase 4A real-project clean-environment restore and one forward migration rehearsal. It does not close Phase 4A by itself.

## Retained limits

- The rehearsal used one local macOS host, one Git repository, one Alpha.5 source, and 21 included files.
- It did not interrupt a real process between target writes. Alpha.24's automated interruption tests remain supporting evidence, not a substitute for a real crash-boundary rehearsal.
- It did not exercise a post-upgrade rollback to Alpha.5.
- It did not test remote transport, encryption-key management, schedules, notifications, large backups, cross-machine recovery, or regulated retention.
- It did not back up application source, application databases, Git objects, dependencies, external services, or runtime control-plane telemetry.
- The isolated upgraded checkout was not merged into AiPet and did not authorize any AiPet feature, release, or production action.

Phase 4A remains open for rollback evidence, meaningful real interruption boundaries, retention and audit-export policy, and broader environment coverage.

