# Phase 4A AiPet digest rehearsal

- Date: 2026-08-30
- Source project: AiPet
- Source revision: `28d53b483d0e5c5a21d9b483221393c3dd83ef77`
- Source branch: `codex/lifecycle-memory-journal`
- Environment: local macOS, disposable Git clones and external backup root
- Primary checkout mutation: none
- External action or paid provider call: none

## Result

The real data-bearing AiPet organization state was copied into four disposable clones. Temple created a content-addressed Alpha.5 backup, upgraded one copy to Alpha.26, restored another copy to the exact pre-upgrade state, injected an interruption after the first restore write in a third copy, recovered that transaction, and then upgraded both recovered legacy copies.

| Boundary | Digest or observation | Result |
| --- | --- | --- |
| Before upgrade | `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68` | recorded |
| Direct Alpha.26 upgrade | `d8a46b733a866f3afbfd4a1f02236457d20ebfdff10ef63f0853f549b42ca802` | changed as expected |
| Post-upgrade rollback | `c1de191bd5f0b6c0e39e4d6896aed3089fa1324eb55d6cd13e1378df76ba3f68` | exact match |
| State immediately before interruption | `4873b285ec1bf90b9a0c0e355b970b6ce8f13a63b99c4f8da9cbd6502a083bdd` | recorded |
| Recovered after interruption | `4873b285ec1bf90b9a0c0e355b970b6ce8f13a63b99c4f8da9cbd6502a083bdd` | exact match; transaction rolled back |
| Doctor on restored Alpha.5 state | bounded unhealthy, `cli_bootstrap=fail` | expected upgrade-required result; no exception |
| Doctor after ordinary upgrade | 36 pass, 0 warn, 0 fail | healthy on both copies |

The primary AiPet checkout remained clean at the same exact revision before and after the rehearsal. The normalized result is stored at `.ai-org/artifacts/WI-0016/aipet-digest-rehearsal.json`.

## Retained limits

This proves deterministic local backup, rollback, interruption recovery, legacy-state diagnosis, and forward upgrade on disposable copies of a real project. It does not prove physical power-loss behavior, filesystem corruption, encrypted or remote backup transport, another operating system, production data recovery, regulated-auditor acceptance, or a multi-machine disaster-recovery process.
