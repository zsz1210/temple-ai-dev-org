# Stage warning policy

The user approved the WI-0215 report recommendation: separate the inherited
80000 operational-Token stage warning from the aggregate hard stop. This slice
implements and tests that policy locally. It does not consume approval for a
new live run, resume WI-0215, or change its sealed evidence.

## Contract

- Only the successor format protocol v2 explicitly selects `warning`.
- Legacy protocols retain their stage hard stop. Invalid policy values fail closed.
- Record the first stage threshold crossing once with observed Tokens and time.
- Keep aggregate 640000 operational Tokens, stage 360000 ms and aggregate
  2880000 ms hard limits. A single stage may use the remaining aggregate budget.
- Missing, malformed or regressed usage, provider/quality failures, and isolation
  violations retain their existing stop behavior. No retries or fallback.
- Before a new stage, recheck the aggregate deadline after preparation; also check
  it after completion, including the final stage. No completion beyond the deadline.
- Use a new protocol and approval binding; old consumed approvals cannot authorize v2.

## Acceptance and risk

Offline tests cover 80000/80001, warning deduplication, legacy hard stops,
aggregate boundary crossing (including prior stages), invalid configuration,
missing usage, preparation deadline exhaustion and final-stage deadline exhaustion.
Run the complete verification suite. This is experiment infrastructure, not a
product routing default or a claim of efficiency. A fresh live comparison still
needs frozen source/protocol, sandbox and independent readiness evidence.

Source of decision: WI-0215/result-report.md and the user's acceptance of the
recommendation. Thresholds are authority boundaries, not empirically optimal values.

## Subsequent live-run authorization

The user subsequently requested completion of preparation followed directly by
the comparison. This authorizes one fresh four-delivery/eight-stage Full, Model,
Model, Full comparison on Terra medium after independent readiness and sandbox
checks. Bind the exact frozen v2 protocol to a new one-shot approval. Retain the
limits above, subscription included allowance only, no purchase/refill/reset,
zero retries/fallback and no extra model judge. Stop on the first protocol,
quality, isolation or hard-limit failure; report partial results honestly.
The consumed WI-0215 run remains immutable and cannot be resumed.

## Fresh diagnostic run: WI-0220

After WI-0218 diagnostics and WI-0219 local CLI verification, the user explicitly
approved starting the proposed new experiment. WI-0220 owns one fresh execution
of this instrument with current diagnostic source, new fixtures and new bound
approval. All limits, route, stop/no-retry and no-spend rules above remain. Earlier
consumed approvals and sealed laboratories are not resumed or overwritten.
