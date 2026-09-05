# WI-0190 Independent QA — PASS

## Identity, revision, and scope

- **Independent QA Identity:** `agent-lulu` (Lulu), assigned to `independent_qa` in `.ai-org/project/assignments.json`.
- **Developer Identity:** `agent-rikku` (Rikku), assigned to `developer` in the same canonical record. The identities are distinct.
- **Reviewed source range:** base `b15b741` through exact behavioral candidate `50ae4f50fcf74d8468e09956e44e1eb9da99ef71` (`Synchronize self-host instructions through the reviewed upgrade`).
- **QA claim:** `claim-20260905225400-44ff49ee`, held by `agent-lulu` against the candidate revision.
- The current checkout HEAD (`61a2250`) adds lifecycle/evidence records after the candidate. Focused tests exercise the candidate's unchanged instruction/package sources; this QA does not treat later records as implementation changes.

The required compact Context preview for `WI-0190` as `independent_qa` was read first. It reported navigation-only authority, no mutation, the exact candidate, the active QA claim, and the Standard `independent_qa -> release_gate` edge without a supplied QA gate reference. I then read `AGENTS.md`, `TEMPLE.md`, the installed `temple-work` Skill and its read-only-support and assurance/recovery references, the approved brief, and ADR-0059.

## Independent checks

| Check | Command / method | Result |
| --- | --- | --- |
| Targeted route, preservation, and distribution tests | `node --test test/proportionate-work.test.mjs test/skill-policy.test.mjs` | **PASS — 5/5.** Covers sequential-vs-governed route wording, parent-owned support restrictions, no formal QA/delivery/resource ownership, bootstrap instruction retention, managed-reference checksum/distribution, upgrade of a synthetic old installation, preservation of a project-owned Skill, Doctor, and Status construction. |
| Repository/docs/package contract | `npm run check` | **PASS.** Repository checks: 115 overlay files and 10 Positions; documentation links passed; package boundary: 411 files, 885319 packed bytes, 3475649 unpacked bytes. Required ADR-0059 and support-reference paths are present; no publication occurred. |
| Current read-only governance inspection | `node ./templew.mjs status . --compact --json --work-item WI-0190` and `node ./templew.mjs doctor . --compact` | **PASS for WI-0190 state and authority.** Status reports `independent_qa`, `agent-lulu`, exact candidate, no unresolved items, and the QA claim. Doctor reports 36 pass, 0 fail; its single stale-parallel-plan warning is retained rather than masked. This QA was governed prepared and attached before that warning was generated, so no stale plan was used to dispatch it. |
| Candidate hygiene / protected scope | `git diff --check b15b741 50ae4f50fcf74d8468e09956e44e1eb9da99ef71`; targeted protected-path diff inspection | **PASS.** No whitespace errors; the candidate changes no `src/` runtime guard, workflow schema, provider/model policy, or WI-0188/WI-0189 sealed artifacts. The WI-0172 protected `test/delivery-control-pair.test.mjs` remains unchanged. |
| Identity and provenance | `jq` assignments/work item, `git show --no-patch`, and `git log`/range inspection | **PASS.** Confirms assigned identities differ and the developer-to-evaluator handoff records the exact candidate. |

## Counterexample review

I challenged the following boundary failures against the candidate text, distributed copy, checksum upgrade coverage, and focused tests:

- Treating ordinary sequential work as a parallel dispatch requirement.
- Relabeling an active/reserved worker or a formal gate as low-cost read-only support.
- Allowing a helper to write canonical/project state, hold independent delivery ownership, claim Independent QA/acceptance, use scarce resources, or proceed when native read-only containment is unavailable.
- Treating a stage handoff, successful composed-finish receipt, or diagnostics from a changed scope as downstream acceptance; hiding a failed diagnostic; omitting mandatory project tests.
- Dropping native entrypoint/bootstrap obligations or overwriting a project-owned extension while distributing the new managed reference.

No counterexample passed. The controlling source makes support parent-owned and non-mutating in `.agents/skills/temple-work/references/read-only-support.md`, sends unmet eligibility to governed parallel work in `references/parallel-work.md`, retains distinct-Identity Standard QA and full gate behavior in `SKILL.md`, and labels diagnostics/receipts as scoped and non-accepting. `AGENTS.md`, `TEMPLE.md`, their project-overlay copies, `temple.lock`, package checks, and the upgrade rehearsal are aligned.

## Result and limits

**PASS — no independent QA blocker found for exact candidate `50ae4f50fcf74d8468e09956e44e1eb9da99ef71`.**

This QA independently ran the focused checks above; it did **not** rerun the full suite solely to advance a stage. The developer-reported 632/632 full verification is retained as developer evidence, not substituted for this QA. The change is procedural instruction guidance, not a sandbox or live-model-adherence proof; no model experiment, release decision, merge, publication, lifecycle transition, or source/canonical-state repair was performed by this QA. This file is the sole persistent QA write.

### Integration constraint (separate from candidate correctness)

At coordinator notice, the immediate base `b15b741` contains 33 commits that are not reachable from refreshed `origin/main`; only PR #58 is open, and the WI-0189/WI-0190 predecessor branches are not yet on `origin`. This is a pending integration/provenance constraint, not a behavioral defect found in `50ae4f5` and not authority for this QA to merge or rewrite predecessor history. Release/integration work must resolve and revalidate the eventual integrated revision separately.
