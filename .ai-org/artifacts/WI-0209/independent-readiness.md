# Independent launch readiness

Reviewer Lulu (`agent-lulu`), existing QA worker `wi0201_lifecycle_recheck`; Developer Rikku (`agent-rikku`). This records the independent reviewer's returned findings, not Developer self-certification.

Verdict: PASS for the newly authorized one-shot WI-0209 experiment only.

- Candidate: `6b1c407f60a337ba1b41467f08a831a2dc1023a2`.
- Protocol: `sha256:666ad249b75ca74531387c4e4d01be571cfe2dfc9906d1cad7da57b3ef687072`.
- Instrument: `sha256:7b5d2d626d61fb2c0ca484584173c5f382320992215a36c4520d7c997c5e763b`.
- Sandbox: `sha256:1f0b816ee7a92d91f8f16d77c0e11a47840d5152dd9d1974cfc48a6eff412503`.
- Provider: `sha256:3fd8617772225720d1b11b97e579f4b3c37a754776ed62372d646e31c5e987c0`.

Independent review rechecked unchanged source bytes, isolation profile source hashes, actual process arguments, installed request schemas, six distinct fixtures and correct prior/current revisions. Both strict sandbox cases passed with zero thread/turn requests. The final candidate passed full verification: 648/648, zero failure/cancel/skip, 152887.955625 ms. Focused suites passed 29/29; independent malformed-map and missing-pinned-entry counterexamples were rejected after correction. The lab was unconsumed with no run or seal at review.

Local tests exercise all twelve orchestrated stages and bounded partial stopping, one-shot consumption, Token/time boundaries, source/config drift, safe denied-event labels, shutdown errors, command response diagnostics, scratch exclusion, concurrent evidence changes and manifest tampering. A separate generation-free classification inspection found all 19 installed ThreadItem variants diagnosable; that classification check is not a complete real model trace for every variant. Existing runtime tests cover wire and interruption behavior. Readiness does not prove that a model will never choose a forbidden operation.

The earlier WI-0209 preparation exposed unsupported quoted CLI configuration keys; the corrected simple-key form was checked against effective configuration before model generation. Three MCP servers and 25 plugins were disabled in the dedicated process. User/global configuration was not changed. Provider shutdown confirmation concerns the owned direct child, not all descendants; the evidence manifest explicitly excludes declared operational scratch and remains subject to independent post-run verification.

Only twelve Terra medium stages, 960000 observed Operational Tokens and 72 minutes aggregate, with 80000/six minutes per stage, are authorized. No retry/fallback/reset/purchase/refill, step-5 execution, merge or release. Prior WI-0208 evidence remains unchanged and inconclusive.
