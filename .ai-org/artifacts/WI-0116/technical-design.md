# Technical design — WI-0116

`scripts/analyze-wave-5a-overhead.mjs` accepts a retained experiment JSON path and an exclusive output path. It validates the known schema, recomputes totals from candidate records, verifies recorded aggregate and pair deltas, and emits descriptive findings plus explicit non-claims.

`scripts/validate-wave-5b-protocol.mjs` validates a protocol observation. The evaluator input manifest contains only arm-neutral package and rubric digests. The observation must attest that scoring occurred in a fresh provider context without coordinator inputs; the frozen-score timestamp and digest must precede mapping-unseal time. Forbidden condition, usage, revision, path, and mapping fields fail the gate.

This is process-input separation, not an operating-system security sandbox. A qualifying live study must create the evaluator in a separate task/context and retain its stable identity plus the exact manifest digest.
