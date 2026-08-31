# WI-0068 developer report

`resolveValidationProgram` now resolves every participant's Provider telemetry directory through the canonical Git-common-directory control-plane resolver. Invalid worktree-local configuration fails during `experiment inspect`, before an adapter can generate content. The resolved private directory is carried in memory and reused by the cross-repository report builder.

The inspection projection exposes only the Git-common-directory policy and whether an explicit value was configured. Regression coverage proves the safe default and the invalid `.ai-org/runtime/control-plane` case. Operator documentation distinguishes runner checkpoints from Provider telemetry.
