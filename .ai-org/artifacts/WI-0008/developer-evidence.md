# WI-0008 Developer Evidence

- Position: Developer
- Agent Identity: Rikku
- Status: implementation complete; candidate verification pending
- Temple source revision used for rehearsal: `fc23facc7d8e6af99b5afc013e96a5e1b2f9a6a8`
- AiPet fixture revision: `28d53b483d0e5c5a21d9b483221393c3dd83ef77`

## Completed

- Verified an external Alpha.5 backup with 21 included files and stable content and manifest digests.
- Proved an obsolete restore plan was rejected after bounded isolated fault injection.
- Applied a fresh plan containing one create, one replace, and 19 identical files.
- Compared every restored included file with the backup; 21 of 21 matched.
- Upgraded only the isolated AiPet checkout from Alpha.5 to Alpha.24.
- Rebuilt generated state and passed Doctor with 36 pass, 0 warn, and 0 fail.
- Reconfirmed the primary AiPet checkout remained clean at its original revision.
- Added the public validation record and updated the Phase 4 evidence status.

## Evidence

- `docs/validation/alpha-24-aipet-recovery.md`
- Backup content digest: `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68`
- Backup manifest digest: `0762d74b5d1992cc5a2027b8a104f6ad89a8ff0f6eb54ac968bef7b416d2979b`
- Restore plan digest: `91623edc4b4148c06ca6b8a8e37af70598d2897a6dd226644e528d5dab5cec26`
- Restore transaction: `2026-08-30T04-45-43-181Z-98c08c89-60f0-4181-8472-3719d718df56`

## Unresolved and retained

- Independent QA must reproduce the documented outcome from a fresh isolated checkout.
- Real interruption-boundary, post-upgrade rollback, retention/audit export, large-backup, cross-machine, and broader operating-system validation remain open.
- No AiPet feature work, merge, release, or production action is authorized by this rehearsal.
