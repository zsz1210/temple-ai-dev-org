# Bounded Lean Test

Use a different Agent Identity from the Developer. Independently verify the exact
Developer candidate, claim that candidate and record actual Test and Lean-closeout
evidence. Reuse one substantive record when it contains both required facts. Only
when acceptance passes:

```text
node ./templew.mjs work-item finish . --work-item WI-#### --position quality_evaluator --operation-id <stable-id> --claim-id <active-claim> --agent-id <verifier-id> --principal-id <principal-id> --revision <full-candidate-sha> --judgment pass --test-evidence <repository-ref> --lean-closeout <repository-ref> --json
```

This records supplied evidence and judgment, not formal Independent QA. Failed
acceptance uses the existing issue/rework route, never a passing finish. Read and
apply the [common obligations](lean-common.md) including diagnostics and recovery.
