# Live result — WI-0064

## Outcome

`partial`; the predeclared strict gate did not pass, so the four-repository rehearsal was not started.

The one permitted Luna Max request completed in 7.6 seconds with no retry, fallback, interrupt, network access, or product-file change. Temple correctly recorded effective model `gpt-5.6-luna`, service tier `priority`, the exact project/Work Item/task/Position/Agent/revision/thread/turn relationship, and 23,265 detailed Tokens.

## Failed strict dimensions

1. The Provider's top-level `thread/start` acknowledgement reported thread reasoning `xhigh`. The requested `max` override was sent only to `turn/start`; the installed `TurnStartResponse`, turn notifications, and Token-usage notification expose no field acknowledging the effective turn reasoning. Temple therefore cannot honestly call `max` Provider-observed.
2. The runner called `thread/read` without `includeTurns: true`, so its response-content check returned false. A read-only follow-up using the same thread and `includeTurns: true` found one turn and matched the expected compact identity response without retaining it.

The second item is a runner bug and has been corrected for future inspection. The first is a protocol/provenance limitation that requires requested turn effort, observed thread effort, and unknown effective turn effort to remain distinct.

## Boundary

No second turn was launched. The 60,000-Token limit, zero-retry rule, and conditional stop before the large rehearsal all held. This result proves the original effective-model correction but does not satisfy WI-0064's stricter overall gate.
