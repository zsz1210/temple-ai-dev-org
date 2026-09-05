# Completing a bounded Lean stage

`work-item finish` combines authorized completion administration with full Status and Doctor checks. It is optional and limited to low-risk, bounded Lean work without UI delivery or an active runtime worker. Existing individual operations and `work-item deliver` remain available. The command does not implement a feature, run product tests, decide correctness or publish anything.

Before completion, identify the current Position, sponsored Agent Identity and Human Principal, hold the active claim, commit the exact product candidate and create the stage's evidence. Resolve missing scope, conflicting ownership and stronger risk through the existing workflow; never downgrade a task to qualify.

## Developer

Supply the same facts as ordinary Lean delivery, plus the explicit Position:

```sh
node ./templew.mjs work-item finish . --work-item WI-0001 \
  --position developer --operation-id build-finish-1 \
  --claim-id CURRENT-CLAIM --agent-id BUILDER --principal-id HUMAN \
  --revision FULL-CANDIDATE-SHA --completed 'Implemented and tested the accepted scope' \
  --evidence docs/developer-evidence.md --json
```

The CLI reuses delivery validation to record the Developer handoff, release its claim and enter Test. The assigned Quality Evaluator still needs to claim Test and verify the candidate independently.

## Quality Evaluator

After verifying the exact candidate, use a different Agent Identity from the Developer handoff and provide an explicit passing judgment with existing evidence:

```sh
node ./templew.mjs work-item finish . --work-item WI-0001 \
  --position quality_evaluator --operation-id test-finish-1 \
  --claim-id CURRENT-CLAIM --agent-id VERIFIER --principal-id HUMAN \
  --revision FULL-CANDIDATE-SHA --judgment pass \
  --test-evidence docs/verification.md --lean-closeout docs/lean-closeout.md --json
```

The CLI validates the actor, current claim, candidate and supplied evidence, then composes release and Lean acceptance. It records the caller's judgment rather than generating one. This is Lean verification, not formal Independent QA or external release approval. Failed or incomplete acceptance remains on the existing issue/rework route.

## Preview, completion and recovery

Use a stable operation ID for each exact attempt. `--dry-run` is read-only; `--expected-plan` binds execution to the preview. Changed facts require investigation and a fresh valid preview. A preview never reserves ownership or proves readiness at a later time.

Lifecycle application and diagnostics have separate outcomes. If the lifecycle writes succeed but Status or Doctor fails, preserve the applied handoff or acceptance and investigate the diagnostic failure. Pending/failed diagnostic attention remains visible, including terminal work. A retry of the identical request validates resulting state, evidence, authority and candidate before repairing diagnostics only. It cannot create a second handoff or repeat acceptance. An already completed replay is historical application, not fresh verification.

An interrupted lifecycle write leaves a recovery journal. Inspect the error, journal and current state, then resume only the identical request. Never delete a journal, switch to individual mutations to bypass recovery, or treat a stale diagnostic result as permission to continue. Full Status and Doctor still run; no incremental checking or cached pass is introduced.

See [ADR-0057](../adr/0057-composed-lean-completion.md) for the contract. Reduced command count is a structural observation; Token usage, model time and end-to-end efficiency need a separate controlled comparison.
