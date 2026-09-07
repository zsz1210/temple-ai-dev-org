# Incremental compact comparison readiness

## Status

Prepared, not live-executed. Independent QA and fresh exact-protocol approval
remain required before dispatch. This is not an experiment outcome or a claim
that compact Temple improves performance. Learning remains a design proposal.

Frozen protocol: `continuity-incremental-approved/v1`.
Digest: `sha256:3568e1f6ec0bf33665d0275661829a9c10c8a0ccde4b3f2fc4dfa453d2333dc2`.
Preparation source: `e9affdf8` (later `afb048d1` only fixes a design-document link).
Private lab identifier: `temple-continuity-live-ftTGJ4`. Absolute paths, runtime
configuration, generated provider schemas and full audit bodies remain local.

| Order | Treatment | Current requirement | Decision informed |
| --- | --- | --- | --- |
| 1 | Current compact Temple | Stable threshold 3000 | Can the corrected instructions deliver this unchanged-scope takeover? |
| 2 | Current compact Temple | Changed threshold 5000 | Can they recover the current requirement while preserving prior accepted behavior? |

Both use Terra medium. Proposed ceilings are 100,000 Operational Tokens/eight
minutes each, 200,000/twenty minutes total, with no retry, fallback, purchase,
refill or reset. These inherited ceilings are not predicted consumption. A
completed compact observation does not yet exist; a repeat cap stop is possible.
The current unknown-usage/cleanup/validity shared-stop policy remains unchanged.

## Generation-free qualification

Executed the committed `prepare.mjs` using standalone Node.js 24.19.0. Runtime
configuration, isolated product oracle, record-descendant oracle and native
observation qualification passed. The preparation opens a configured provider
thread but never sends `turn/start`. Two subjects were frozen. No `consumed.json`,
`run.json` or `seal.json` exists in the new lab as of this preparation review.

The runtime bundle is byte-identical to WI-0239's current compact bundle:
`sha256:ddbf85b0a72e5c4a7bee0816f3e6c746c6d70fdd44263da1286535400f582ef6`.
Both actual bundles match their manifests; both CLI versions are `0.153.4` and
the generated provider schemas match. Instrument hash:
`sha256:f9c5f7de735db9d037d1f14370d9df5415e5a89aab44579ac7844193a43e2537`.
The instrument changes only coordinator matrix selection; no Learning proposal,
historical result, solution or project-local lesson enters the actor runtime.

## Retained baseline compatibility

Read the original pre-work commits through Git without checking out or editing
old subjects. The WI-0239 original protocol and result still match their seal.

| Condition | Tracked files | Byte-identical to old compact pre-work tree | Fresh pre-work commit |
| --- | --- | --- | --- |
| Stable | 133 | 124 | `6a1ba6b71be2c922212a043ebe1b2f2c728d7a01` |
| Changed-spec | 134 | 125 | `1ed8448814fa4cc56fe1441bfed4947862754298` |

The same nine paths differ in each condition. Explicit classification:

- `agents.json`, `project.json`, Work Item and `temple.lock`: initialization,
  creation, assessment and migration timestamps only; no changed authority,
  membership, scope, acceptance, managed hashes or instructions.
- Event history: the same two events with different timestamps.
- Capability view: `generated_at`; status view is regenerated during installation.
- `HANDOFF.md`: only the fresh predecessor revision reference differs.
- `history/verification-v1.json`: predecessor revision, observed test output
  timings and elapsed time differ. Command, successful exit, signal and historical
  authority scope are preserved; the fresh historical check is not a new actor sample.

Product modules, current specification, tests and instruction content match.
The complete fact digest is therefore **not** identical: regenerated provenance
is real and is not replaced with old values to manufacture equality. Initial
solutions are unfinished work, not the former actors' finished output.

Historical reference selection remains [WI-0240's inventory](../WI-0240/inventory.json).
Cache, service time, ordering and regenerated provenance prevent a causal matched
claim against those historical observations. Report results by condition and
contract; do not pool historical means or recast censored usage as a full result.

## Human decision still pending

An in-app confirmation requests this exact two-subject digest and proposed limits,
plus an independent review before execution. Until the answer is recorded, the
new approval is unconsumed and no live execution is authorized by this document.
The earlier six-subject approval and its stopped run remain separate and retired.

The next report must distinguish correctness, administration, Token components,
setup/elapsed time and missing observations. The experiment tests the prior
compact-instruction changes, not the proposed automatic Learning loop.
