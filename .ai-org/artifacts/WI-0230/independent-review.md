# Independent field-remediation review

Reviewer: `agent-lulu`, Principal `human`; actual independent runtime `/root/field_acceptance`. Developer: `agent-rikku`. Review reservation: `worker-20260915174040-464e550f`, claim `claim-20260915174040-a50e542b`. Initial responsibility: Quality & Evaluation Engineer. This reviewer made no implementation or test-source contribution.

Reviewed behavioral candidate: `535c306e38355864adc336f0a1289f105855bbdd`, on `codex/field-remediation`. Scope: WI-0230 and joined WI-0231, WI-0232 and WI-0233; approved specification `docs/planning/field-remediation.md` and ADR-0067.

## Current judgment

**Test: rejected. Evaluation: rejected. Independent QA: pending, not performed as a lifecycle stage.** V10 has two reproduced defects. The full `npm run verify` result was still pending during this review; focused or historical passes do not replace the final full run. No organizational acceptance, merge, publication or deployment is authorized by this report.

## Findings requiring repair

### IR-01: Reconciliation CLI fails after canonical writes

Priority: P1. Surface: `src/field-commands.mjs`, the generated-view rebuild after `reconcile apply`.

Independent reproduction created a complete initialized Standard project, committed a base, added a valid resource on an incoming branch, returned to the base, generated a parallel plan, and ran the public `reconcile preview` followed by `reconcile apply --fingerprint` with the returned preview. Preview succeeded. Apply exited 1 with `EXECUTION_UNCERTAIN`, `mutation_status: unknown`, and `Cannot read properties of undefined (reading 'work_items')`.

The CLI calls `writeStatus(target)` while the function requires `writeStatus(target, status)`. The canonical reconciliation runs before that call, so the command can report failure after changing records. This is a real integration failure, not a synthetic exception injection. It recreates the field problem of a contributor encountering a blocker without a completed recovery path.

Expected: the supported CLI completes the valid reconciliation and rebuilds applicable generated views from the resulting state; if derived-view generation fails, report actual canonical mutation state and a precise recovery action. Include the generated parallel plan in freshness/rebuild verification; source inspection shows only capabilities and status being rebuilt in this candidate.

### IR-02: Identity reconciliation can orphan an unchanged active claim

Priority: P1. Surface: `src/reconciliation.mjs`, `validateCombinedDocuments`.

Independent reproduction used the public contributor setup API to create a qualified non-default Developer and separate reviewer, released the fixture's original claim, and claimed its Standard Build item with `agent-independent-builder` / `principal-independent`. No runtime or registered task was attached to that active claim. An incoming branch removed this Agent and its sponsorship/membership. Preview selected only `agents.json` and `collaboration.json`.

Expected: a conflict before any write because an unchanged Work Item still holds the removed Agent's active responsibility. Observed: CLI exit 0, `valid: true`, `conflicts: []`, with a changeset removing that active claimant. The Work Item was absent from `validation_inputs`.

The validator checks selected Work Items and those referenced by live runtime/task records; an ordinary claim without either is not included. Validate all affected live canonical claims and fingerprint the consulted records/inventory so newly added or changed claims invalidate a preview. Preserve historical references without silently relabelling responsibility. Extend the check to current membership/sponsorship/qualification compatibility, using the same documented actor semantics where applicable.

## Independently observed passing evidence

V11 public CLI integration passed on this candidate: export an explicitly selected historical binary artifact; verify the exported archive; import it into a real local Git clone; preserve `registry_mutated: false` and `acceptance_granted: false`; reject a tampered archive with exit 1 and `mutation_performed: false`. These are local macOS Node v24.20.0 observations. They do not establish external source authentication, human acceptance or independently operated machines.

The independent reproduction script is `/tmp/temple-independent-field.mjs`; observations were retained in `/tmp/temple-independent-field-results.json` and `/tmp/temple-independent-field.log`. Fixtures were removed after the run. These temporary files are supporting reproduction material; the findings and observed outcomes above are the durable record.

## Coverage review and remaining work

The reviewer read the operating contract, Work Skill, frozen V01–V16 specification, ADR-0067, developer handoff and verification report. Source inspection covered shared actor selection/provenance, local binding, lifecycle evidence, measurement fingerprints/reuse, archive integrity, reconciliation validation and CLI orchestration, and delivery-attention state.

| Scenarios | Current review status |
| --- | --- |
| V01–V05 | Developer positive/negative fixtures identified and actor/lifecycle design inspected; final corrected full-run evidence and acceptance pending. |
| V06–V07 | Declared-input fingerprint, immutable attempt/artifact checks and conservative reuse inspected; final full-run evidence pending. |
| V08 | Attention-state and privacy fixtures identified; browser evidence belongs to earlier candidate `56700f3a`, final applicability still needs confirmation. |
| V09 | Actual-platform adapter tests identified; trusted-local limits and unavailable Windows execution remain explicit. Final full-run evidence pending. |
| V10 | Rejected by IR-01 and IR-02. Repair and independent rerun required. |
| V11 | Independent end-to-end CLI positive and tampering controls passed; developer historical-byte/path/clone tests identified. Preserve the reusable CLI result if these paths remain unchanged. |
| V12 | Existing interruption/rework tests identified; IR-01 exposes an additional incomplete recovery path. Final recheck required. |
| V13–V16 | Timed onboarding, duplicate-label and strict-policy controls identified and source semantics inspected; final corrected full-run evidence and acceptance pending. |

No account usage was polled. No paid model call, model-cost comparison, Windows runtime or independently operated human-machine test was performed. The reviewer will return to the exact repaired candidate for bounded reproductions and final judgment after root supplies complete verification and advances the applicable lifecycle stage.
