# Generation-free readiness

Candidate: `3bfae21d8b2cc39df325f025b0e02f4a2ab61669`.
Prepared lab identifier: `temple-continuity-live-RlBOEL` (coordinates remain private).
Protocol: `continuity-incremental-approved/v1`.
Protocol digest: `sha256:2dd89072ebfead894a2eb614a6df2e72d3498faefc58c0197b32ba9f2c876df2`.
Instrument: `sha256:6cfb88bf9f5d94caf29ee55292af978a739526b493a9ea254e5fb70fd501583b`.
Runtime bundle: `sha256:4c6e0aefe4b9b7743b537c47c7862f9b3768de11699a32032edb253f0d048730`.

Reused the committed WI-0241 preparation script under the previously qualified
standalone Node runtime. Its initial invocation under Homebrew Node was rejected
by the dynamic-library isolation check before thread creation or model generation.
No guard was weakened: rerunning generation-free preparation with the known
standalone runtime passed. This is not a live-subject retry.

Codex CLI remains 0.153.4. Fresh thread configuration, isolated product/record
oracle qualification and native observation qualification passed. No turn/start,
consumed approval, run or seal existed at readiness inspection.

Read-only comparison against the sealed WI-0242 runtime found exactly one changed
distributed file: `src/context-entry.mjs`. Normalizing its read-policy string makes
the complete source equal to the parent. Every other bundled file is byte-identical.
The string grows from 181 to 431 bytes; selected whole-source content remains
63,322 bytes for the changed condition, and compact navigation grows from 4,827
to 5,077 bytes. This is not an input-size reduction or measured read reduction.

The new subjects start from unfinished synthetic seeds:

- Stable: `86f532d89e99446938a51a3c6668fce21196e393`.
- Changed-spec: `211649e97d6b914ac6ad1ffbd6fefbab52be23ea`.

Preparation regenerates provenance (timestamps, predecessor references and local
test timing), not historical solutions. The new record-alias oracle and bounded
unknown-reason counters differ from the old coordinator instrument, but not actor
product scope; preserve original old rejection and mark comparisons historical.
Original WI-0242 protocol/run digests still match their seal.

The maintainer authorized implementation followed by this bounded experiment in
the current request; [design](design.md) records limits. Execution still requires
successful complete verification, distinct QA and a fresh execution record binding
this digest. This file is readiness evidence, not results or an independent review.
