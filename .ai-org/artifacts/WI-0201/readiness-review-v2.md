# Native helper lifecycle readiness recheck

Outcome: passed for bounded readiness. Candidate `5fda83aca2c361fbe369296f0539a0957cc8a0ff` resolves the previous spawn-completion metadata bypass. Lulu performed this fresh review independently of Developer Rikku as the claimed Quality Evaluator for this Lean Work Item. This is not a Standard Independent QA gate, production approval, or live compatibility result.

Reviewer runtime: `/root/wi0201_lifecycle_recheck`.

Seal digest: `983733542e2b772f1670ebc36346fc044e482cfea6e16dc391cc0857e1f8858f`. The exact candidate Git contents, current bound files, current HEAD and freshly generated installed Provider contract match this seal. WI-0196 through WI-0200 artifacts are unchanged relative to the candidate parent. The existing predecessor byte-identity regression also passed.

## Prior blocker and complete path

Both activity discovery and successful spawn completion now nominate candidates only. Neither discovery path directly binds a child. Child turn-start and a candidate hint, in either order, trigger one metadata read. The executor checks response schema, exact child identity, parent identity, working directory, ephemeral retention, configured model and non-null configured effort before binding. Child events and evidence remain buffered until that check succeeds. The remaining spawn-completion acquisition loop sees only already validated children and cannot bypass this gate.

The independent replay reconstructed the previous failure order using the schema-valid fixture, without changing repository source: spawn completion before child-start, then child message, usage and terminal, followed by parent usage, structured answer and terminal. Metadata simultaneously specified a foreign parent, non-ephemeral retention and foreign directory, with a 700 ms response delay. A second replay placed spawn completion after child-start. Both now perform exactly one metadata read, stop with `child-metadata-parent-mismatch`, attribute no helper actor or message, and retain `cleanup.status=unconfirmed`. The prior false success is not reproduced.

An additional independent replay removed helper usage from an otherwise completed spawn-only trace. It stopped with `incomplete-lifecycle`, confirming that terminal events alone do not establish success.

The complete event suite passed 39 of 39 tests, with no failures, skips or cancellations. It covers activity-only and spawn-only discovery before and after child-start, delayed metadata, buffered evidence, route/identity/retention/directory mismatches, failed acquisition, nested and foreign events, helper writes, candidate overflow, usage consistency, delayed helper completion, failed terminals and uncertain cleanup. Parent completion waits for the expected child terminal; failures interrupt only validated observed actors, and unbound hints retain cleanup uncertainty. Passing targeted tests are not full repository verification evidence.

## Real API evidence and limits

The installed Provider zero-generation API probe passed again. Ephemeral `thread/resume` with and without `omitTurns:true` returned JSON-RPC `-32600`, categorized `rollout-unavailable`. `thread/read` with `includeTurns:false` returned matching identity, ephemeral flag, working directory, configured Terra/medium route and zero turns. All six metadata checks passed. No `turn/start` or live model generation was performed by the API probe or this review.

Configured model and reasoning effort are not per-turn execution telemetry. A metadata read is not a subscription or proof of native helper execution. The synthetic replay results and real metadata probe justify the next exact-seal bounded compatibility attempt only; live end-to-end compatibility, parent-child usage nonduplication and broader efficiency remain unproven. The Integration Owner owns separately reported full verification, lifecycle acceptance and enforcement of the existing human approval and run-once guards before any live attempt. No lifecycle or implementation files were changed by this review.
