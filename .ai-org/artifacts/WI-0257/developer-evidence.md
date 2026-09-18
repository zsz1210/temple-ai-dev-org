# Compact evidence candidate

Developer: agent-rikku. Product candidate:
`5a6e4f8ef4015a9b6ebdc9d865170da278186acd` in sibling worktree
`../temple-compact-evidence`, branch `codex/compact-evidence-output`.

Implemented an opt-in read-only command, conservative Node spec success-line
omission, lexically exact JSON minification, digest-bound original reading and
regular UTF-8 bounded file validation. Failure blocks, summaries and limitations
remain visible. No dependencies, proxy, model calls or gate changes.

Seven targeted tests passed; fast repository/package checks plus 58 fast tests
passed before final documentation indexing. Package allowlist changes only add
the module and two public docs (451 -> 454 cap; same roots and byte cap).

Seven immutable prior samples: 83,653 original payload tokens -> 33,713 compact
payload tokens; actual JSON envelopes total 40,880 tokens (o200k_base). All 74
predeclared markers retained, and seven digest-bound original reads were byte-equal.
2,389 top-level passing lines omitted; indented subtests deliberately retained.
Fourteen one-shot CLI calls, zero model calls. Compact CLI process time summed
1,652.98 ms for seven samples; not a provider latency/cost measurement.

Full frozen-candidate verification and distinct verifier judgment are pending and
must be recorded before completion. Prior green runs are not their substitutes.
No new task, main merge, release, provider experiment or global adoption implied.

Detailed reproducible sample measurement is retained outside the framework package
at sibling `temple-headroom-offline-2026-09-19/temple-implementation/measurements.json`.
Coordinator should retain final summary here after verification.
