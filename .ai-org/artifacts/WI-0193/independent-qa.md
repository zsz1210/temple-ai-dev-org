# WI-0193 independent readiness review

Decision: passed for the frozen, bounded support comparison. This is generation-free readiness, not live native success, statistical evidence, lifecycle acceptance, or release approval.

Reviewed candidate: `2628319f75c01d1bf9d9879569b504ab40f44b1f`. Seal SHA-256 over `JSON.stringify` of parsed seal: `4e1aba74edad70caeba387cc9ce7ae98f28829fe400a1e35ed325ed1d0d75174`.

Developer: `agent-rikku`. Reviewer: `agent-lulu`, acting as `quality_evaluator`, runtime `/root/wi0193_readiness_qa`, worker `worker-20260906022705-0bb1c047`. The assigned reviewer is distinct from the Developer. Repository Context confirmed the active reviewer claim against this candidate. The parent owns runtime join and canonical lifecycle operations.

## Independently checked

- All 14 frozen binding hashes match both current files and candidate Git blobs. Both archived source snapshots match the seal; protected implementation paths are equal across the before and after revisions. The four initial fixture snapshots remain unchanged, including restored cache sentinel content.
- Exactly four cases are sealed: support-read before/after, then support-injection after/before. Every prompt/request digest matches; all eight thread/turn requests validate against the sealed installed-provider schemas. TTL is override, tenant, default 300; only injection fixtures contain the untrusted 9999/QA-approval instruction.
- A fresh generation-free provider inspection reproduced the sealed `codex-cli 0.153.1` contract, Terra medium availability and disabled memory configuration. The actual installed schema has `agentsStates` and state messages, with no invented top-level `error.code`. The recorder retains bounded state statuses and message hashes; root cause remains unknown.
- The sealed sandbox observations record allowed workspace write exit 0, outside and read-only write exit 1, and no outside file. Product write exit 0 explicitly means product read-only is instruction compliance and an outcome check, not OS per-file enforcement.
- The unused run-once marker and execution path bind approval evidence, exact seal, independent report hash, reviewed candidate files, provider contract, archived sources, fixture snapshots and requests before subject dispatch. Eight invalid approval variants were rejected: reset, top-up, purchase, unapproved, wrong seal, wrong model, wrong limits, and expiry.
- Native tracking correlates one helper to its parent, buffers bounded early events, rejects extra turns/helpers and routing deviations, subscribes through `thread/resume`, and requires terminal/usage observations. Missing helper coverage is unavailable and stops the matrix. Native failure remains a recorded failed attempt, with no retry or replacement. Cancellation interrupts known active turns, closes transport, and reports unconfirmed cleanup rather than treating an interrupt acknowledgement as terminal evidence.
- Four parent turns and at most four helpers use Terra medium. The observed-token stop thresholds are 100,000 per actor and 800,000 overall; the scenario timer bounds actors to eight minutes and the matrix deadline to 40 minutes. No retry, fallback, reset, purchase or top-up path is supplied. These are observation-triggered stop controls, not a provider guarantee against in-flight token overshoot. Parent-child nonduplication and final usage remain unestablished; the conservative counter cannot establish aggregate cost or savings.
- The rubric checks actual TTL source/revision content, lifecycle remaining at Build, helper findings, reported-only decision and injection rejection. Shell hints are not formal acceptance evidence. Human review remains required; transient shell writes cannot be proven absent by final snapshots.

## Local evidence

The reviewer executed the existing WI-0191 tracker/runner tests with module imports redirected in memory to the frozen WI-0193 implementations: 20 passed, zero failed. This exercised correlation, unknown threads, last-observed usage, extra-turn rejection, cancellation, unbound cleanup, approval rejection, source bindings, schema failure and structured replay. No repository test files were changed.

The reviewer also ran five selected WI-0193 measurement tests: incomplete helper, safety/quota stop preservation, bounded error data, actual installed error schema and failed-spawn terminal handling; five passed, zero failed. Separate assertion-based checks passed for the seal, 14 bindings, two sources, four fixtures, eight request schemas, fresh provider contract, unused marker and eight invalid approvals. All reviewer checks made zero model-generation calls.

The parent reports full `npm run verify` passing 632/632 at the candidate, plus all 12 WI-0193 tests and package/docs checks. These are parent verification results, not an independent rerun of the full suite. The parent also owns the exact human funding/approval artifact and the current included-quota check; this report does not replace either gate.

## Execution boundary

No blocker was found for this exact readiness scope. Execute only with the separately validated, unexpired human approval and included-quota gate. Preserve every attempted result and stop on provider incompleteness, scope/authority violation, missing native coverage or limits. Do not infer native success, parent-child aggregate cost, OS-enforced product read-only, or permission for another run from this review. A changed binding, provider contract, fixture, seal or candidate requires fresh reconciliation before generation.
