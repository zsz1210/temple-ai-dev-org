# WI-0178 Independent QA — PASS

## Independence and scope

- **Independent QA Identity:** `agent-lulu` (Lulu), confirmed by `.ai-org/project/assignments.json`.
- **Developer Identity:** `agent-rikku` (Rikku), confirmed by the same assignments record. The identities differ.
- **Candidate under test:** `6521fc50047478ced59cd9fe0a65f1d4d2c4c3df` on `codex/wi-0178-delivery-entry`; its only parent/base is `18c954cfe7f276c46b89a680f05224da5f80ac33`.
- **QA claim:** `claim-20260905082936-ff6e0634`, assigned to `agent-lulu` for the candidate above. This QA did not inspect developer evidence, evaluator conclusions, or coordinator results before reaching its findings.

## Governing review route

Ran the required non-writing compact Context preview for `WI-0178` using `--position independent_qa --compact --no-write --json`. It returned navigation-only authority, no mutation, the active Independent QA claim, the exact candidate revision, and the `independent_qa -> release_gate` edge with no supplied gate reference. I read the checkout's `AGENTS.md`, `.agents/skills/temple-work/SKILL.md`, its applicable Lean delivery and assurance/recovery references, the approved work order, and ADR-0054 before testing.

## Exact-candidate evidence

| Check | Command / method | Result |
| --- | --- | --- |
| Identity and revision | `jq` of assignments/work item; `git show --no-patch`; `git rev-parse HEAD` | PASS — Developer `agent-rikku`, Independent QA `agent-lulu`; HEAD and claim base are the requested candidate. |
| Delivery/context/error contract | `node --test test/delivery-entry.test.mjs test/lean-delivery.test.mjs test/skill-policy.test.mjs` | PASS — 25/25 tests in 22.5 s. Covers typed input rejection, claim/actor/principal/evidence guards, stale plans, exact clean candidate, rework, all five interruption boundaries, pending-output/evidence drift, symlink rejection, active-worker refusal, expiry rechecks, compact read-only behavior, and Skill scenario contract. |
| Installed/upgrade/context coverage | `node --test test/context.test.mjs test/phase4-installation.test.mjs` | PASS — 17/17 tests in 6.8 s. Covers fresh initialization, managed/project-owned Skill discovery, compact authority routing, and project-owned Context Map preservation through upgrade. |
| Candidate hygiene and sealed-scope exclusion | `git diff --check <base> <candidate>`; `git diff --exit-code <base> <candidate> -- .ai-org/artifacts/WI-0172 scripts/delivery-control-pair.mjs test/delivery-control-pair.test.mjs` | PASS — no whitespace errors and no changes to the excluded comparison artifacts/scripts/test. |
| Independent runtime exercise | Disposable fixture created by `test/helpers/lean-delivery-fixture.mjs`, then actual pinned CLI Context/Delivery calls; fixture cleanup in `finally` | PASS — compact response reported `authority: navigation-only`, `mutation: false`, and candidate action `work-item deliver`; injected failure at write 2 returned pending recovery; a matching CLI invocation returned `resumed`, `testing_performed: false`, and state `test`; a final replay returned `already_applied` with unchanged canonical bytes. The temporary fixture was cleaned. |

## Static/adversarial review

Reviewed the candidate implementation without modifying it. Relevant guard locations are:

- `src/lean-delivery.mjs:20-43` rejects unsafe relative paths and symlinks; `:76-83` requires the candidate be exact current HEAD with a clean declared product scope.
- `src/lean-delivery.mjs:150-220` confines composition to eligible low-risk, bounded, no-interface Lean Developer Build, verifies active claim/sponsorship/eligibility and active worker absence, and prepares the four controlled outputs.
- `src/lean-delivery.mjs:223-305` validates recovery journal paths/digests, rechecks time-dependent eligibility/evidence and inputs/outputs, resumes only the same normalized request, and maps pre-write guards versus uncertain persistence state conservatively.
- `src/context-entry.mjs:17-91` produces a navigation-only compact projection with `authorization_granted: false`, preserves warnings, and retains no source bodies.
- `src/operation-errors.mjs:1-26` reports bounded typed recovery guidance with `automatic_retry: false` and no authority/external action.

Counterexample search found no acceptance blocker: wrong claims and identities, unsupported/duplicate flags, stale plan/evidence/policy, profile/UI/risk ineligibility, active worker, evidence/output drift, journal-directory symlink, interruption after each journal/output boundary, expired evidence/qualification, and completed replay after Test ownership are all exercised and fail closed or recover as specified.

## Result and limitations

**PASS for the exact candidate.** The focused QA evidence supports the required Independent QA gate, subject to the coordinator's separate full-suite/evidence normalization work. This report does not claim a release decision, production authorization, model-token savings, usability proof, or a new model experiment. No source, canonical JSON, lock, event, generated view, or sealed comparison record was changed by this QA; the sole persistent QA write is this assigned artifact.
