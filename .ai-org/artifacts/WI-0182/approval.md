# Fresh bounded comparison authority

The user's latest instruction in the delivery-efficiency task explicitly asks to run another comparison as the next step after WI-0181. This is a fresh request. The earlier explicit request to include GPT-6 medium alongside Terra remains part of the comparison scope.

The coordinator disclosed an eight-stage screen: one ordinary/Temple pair for `gpt-5.6-terra` medium and one for `gpt-6-astra` medium, each with a fresh Builder and Verifier. Limits retain the previous 80,000 observed Operational Tokens and six minutes per stage; total limits are 640,000 Tokens and 48 minutes. This is half the previous matrix's stage/aggregate envelope, with no per-stage increase. The current request authorizes this bounded run; it does not reuse WI-0179's consumed approval.

Only existing included allowance is used. Purchase, refill, reset, fallback, new actor-turn retry and post-stop continuation are forbidden. Actual availability is checked before generation. A rate-limit or frozen protocol stop is reported as an incomplete result, not permission to obtain more capacity.

After independent source/readiness review, `approval.json` binds this actual user request to the exact fresh `matrix.frozen.json` digest, bounds and Work Item. Its timestamp records the authorization binding, not a fabricated earlier user-message timestamp. The user did not inspect or type these hashes; the coordinator selected and froze the implementation details within the authorized comparison request.

The matrix is run once only. This authorization grants no merge, release, publication, external message, extra task, higher budget or additional model. Historical approvals, run-once locks and sealed labs are preserved unchanged.
