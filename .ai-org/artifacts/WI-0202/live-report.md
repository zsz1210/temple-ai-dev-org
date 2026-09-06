# Integrated helper lifecycle regression

## Outcome: not compatible

The single live attempt began 2026-09-06T06:33:30Z and lasted 40.602 seconds. It stopped with `invalid-child-activity`. No retry, fallback, reset or Credit purchase occurred. The report closes neither compatibility nor the overall repair objective.

The metadata path succeeded: one helper was bound with `activity-metadata` after validation. The parent last-observed Operational Tokens were 31,402 and helper 13,901. These are separate observations, not final account totals; parent/child nonduplication is unestablished and a further unbound actor has unknown usage. Do not claim their sum as full consumption or cost.

The first rejected event is subAgentActivity emitted on the bound helper thread and names a distinct additional child. A turn-start for that additional actor follows. This is evidence of nested delegation, not the previous missing-rollout acquisition failure. The one-helper/no-grandchild boundary was violated and the guard correctly stopped the attempt.

The event journal contains interrupted terminal notifications for the helper and parent. The tracker recorded only the helper terminal; cleanup remains unconfirmed, including the additional unbound actor. A parent interrupted notification can coexist with unfinished tracked items, so terminal-state observation must be separated from successful-work completeness. Do not promote the journal notification into a clean entire-process outcome.

No structured final answer was returned. Task quality is unmeasurable. Final file snapshots report no changed or out-of-scope paths; transient writes are not proven absent. No separate experiment app-server remained in the subsequent local process check; that observation cannot establish the missing actor terminal or complete usage.

## Remaining design risks

The shared developer instruction currently requires exactly one helper and is potentially inherited by helpers; the explicit no-grandchild clause did not prevent the observed behavior. This is a causal hypothesis from the request composition, not recovered proof of the child's decision process. Parent-only orchestration must be separated from inherited leaf instructions. Before any further model run, verify the installed Provider's supported native depth limit as a prevention mechanism, rather than relying only on after-the-fact observation.

Cancellation also needs a tested distinction between interrupted terminal observation and successful completion with all tracked items closed. Successful completion must keep the completeness requirement; interruption must not falsely erase observed terminal state. Retain unknown status for actors lacking validated identity or terminal evidence.

The real API probe, 39 targeted tests and full 632-test verification passed, but they do not establish these remaining behaviors or live success. No additional live run is authorized by this report. Preserve this sealed outcome and review the parent/leaf and cancellation design before another experiment.
