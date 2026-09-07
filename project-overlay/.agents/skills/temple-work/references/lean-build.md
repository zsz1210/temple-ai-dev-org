# Bounded Lean Build

Applies only to the eligible Developer with an active claim. Implement the approved
scope, run the required product checks and commit the exact candidate. Record real
evidence once and reference it from finish:

```text
node ./templew.mjs work-item finish . --work-item WI-#### --position developer --operation-id <stable-id> --claim-id <active-claim> --agent-id <builder-id> --principal-id <principal-id> --revision <full-candidate-sha> --completed <facts> --evidence <repository-ref> --json
```

Finish composes handoff, claim release and Test entry; it does not verify the product
or accept it. Preserve unresolved facts and do not claim completion if acceptance
failed. The next Verifier must have a different Agent Identity. Read and apply the
[common obligations](lean-common.md) including diagnostics and interruption handling.
