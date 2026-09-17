# Corrected diagnostic recovery candidate

Candidate: `e8e1e462ae07a2b6884f30bdb6fb90dde2dda73c`.
Developer: agent-rikku. Node.js: v24.20.0.

`node --test test/lean-finish-recovery.test.mjs`: 13 passed, zero failures,
17.62 seconds. `git diff --check` passed. Full `npm run verify` started on this
exact candidate; completion must be recorded separately before acceptance.

The prior candidate d7c81d8 passed 1,262 offline tests but failed independent
adversarial review. Do not reuse that passing suite as qualification of this fix.

Corrections bind the original plan's inputs and scope to the canonical receipt,
validate crash-persisted diagnostics and original source binding before settlement,
and permit only Git-proven unrelated worker/reservation drift. Original candidate
registry bytes must match the original snapshot digest. Target entries and global
registry metadata/definitions remain unchanged; current Doctor still validates all.

Additional regressions cover scope narrowing, input deletion/change, locally
recomputed plan digests, corrupted crash diagnostics/source binding, later read
validation, target/global runtime drift, and unprovable original runtime bytes.

No live recovery, acceptance, merge, release or provider experiment was performed.
Independent verification must challenge these protections before WI-0246 recovery.
