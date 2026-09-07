# Optional bounded Lean execution

Use for optional `work-item finish` on an existing low-risk bounded Lean Build or Test task without UI delivery. Standard, High-Assurance, recovery, unclear scope, conflicting ownership and active runtime workers retain the existing route. This procedure never downgrades a profile or grants implementation, spending or external authority.

## Read and claim

Choose one reading route. The initial compact `context resolve` plus required routed reads is sufficient; `finish` does not require a packet or `context enter`. Do not reopen unchanged bodies still available in this session. Bootstrap, native instructions, changed authority and required unselected sources still apply.

If material delivery is needed, this optional entry may replace the compact preview, with explicit identities:

```text
node ./templew.mjs context enter . --work-item WI-#### --position <position> --agent-id <agent-id> --principal-id <principal-id> --no-write --json
```

This opts in and may replace the initial compact preview. Read the returned route and reasons. An eligible packet contains required material and source provenance; fallback returns existing compact navigation. Read the delivered whole instruction, policy and evidence bodies, plus required unselected references. Reuse only bodies actually read, still available and unchanged. Derived inventory selections do not replace an explicitly required whole source. Bootstrap and native provider entry instructions remain mandatory; receiving material proves neither loading nor comprehension.

Neither reading route claims work. If unclaimed, use `work-item claim` with the eligible actor and current base revision. Recheck after changed state or authority. Entry's digest is not the finish preview digest or mutation permission. Keep implementing/testing separate from lifecycle commands.

## Complete this stage

For Developer, after committing the exact candidate and recording real evidence:

```text
node ./templew.mjs work-item finish . --work-item WI-#### --position developer --operation-id <stable-id> --claim-id <active-claim> --agent-id <builder-id> --principal-id <principal-id> --revision <full-candidate-sha> --completed <facts> --evidence <repository-ref> --json
```

For Quality Evaluator, independently verify the exact Developer candidate using a different Agent Identity, claim that candidate and create test/Lean-closeout evidence. Only for passing acceptance:

```text
node ./templew.mjs work-item finish . --work-item WI-#### --position quality_evaluator --operation-id <stable-id> --claim-id <active-claim> --agent-id <verifier-id> --principal-id <principal-id> --revision <full-candidate-sha> --judgment pass --test-evidence <repository-ref> --lean-closeout <repository-ref> --json
```

Use one completion operation, not `deliver` followed by `finish` or a second manual handoff/release/transition. This records caller-supplied evidence and judgment, not formal Independent QA. A failed verification follows the issue/rework route. `--dry-run` and `--expected-plan` are optional, not mandatory round trips. Never reuse an unsettled operation ID with changed facts.

## Inspect and stop

Inspect both `mutation` and `diagnostics`. Full Status/Doctor results can satisfy their checks for the unchanged verified scope; no extra call is required solely to repeat those results. Diagnostics failure after applied lifecycle writes is not rollback or success. Preserve attention even if the Work Item is terminal. After inspecting the receipt and state, the identical request may repair diagnostics only when its candidate, evidence and authority still match. Historical replay is explicitly historical, not fresh verification.

For an interrupted journal, use the identical finish request after inspection; never delete recovery state or bypass it through individual mutations. Read [Assurance and recovery](assurance-and-recovery.md) if necessary. Stop at this stage's recorded completion and next owner; no merge, publication or new task is implied.
