# Doctor compiler reuse verification

Baseline `d3892f6b018c006c28d6cf13590548fed9561f53`; candidate `bcafc86e27b59207b0ec5ae78c5089e5c3c86b87`. Developer Rikku. Existing files, schema reads, formats, meta-schema validation, semantic validation and learning checks remain current on every call. Only a call-local base compiler is reused for self-contained explicit draft-2020-12 schemas. User schemas are removed before each compilation. Other dialects, external references, nested identities and built-in identity collisions retain a fresh compiler.

Focused command: `node --test test/schema-validation-isolation.test.mjs test/phase4-installation.test.mjs`. Exit 0, 8/8 passing, zero failures/skips/cancellations, 3632.330667 ms. Three new controls supplement unchanged installation tests; they compare isolated validator errors for ID/reference/format/compile cases, concurrent roots and fresh mutations, and mandatory parse/required/semantic checks. Raw log will be archived.

Bounded elapsed-time and memory comparison completed using eight fresh alternating processes (four per arm), five real Doctor calls per process on one read-only synthetic initialized project. GC is explicit only after timed calls to help distinguish live heap from collectable allocation. No production GC behavior is modified. All 40 Doctor results were healthy with identical check digests. Baseline source copies preserve the exact old module bodies except import locations needed for the external harness.

| Median across four processes per arm | Baseline | Candidate |
| --- | ---: | ---: |
| First Doctor call | 293.050 ms | 178.520 ms |
| Process peak RSS during five calls | 210.109 MiB | 148.750 MiB |
| JS live heap after fifth explicit GC | 15.030 MiB | 15.508 MiB |

Observed first-call time decreased 39.1%; process peak RSS decreased 29.2%. These are bounded synthetic observations under an explicit-GC measurement protocol, not a whole-workstation, full-suite or leak diagnosis. Retained heap was not reduced. Ajv may retain generated code references until the call-local compiler becomes unreachable; removing registered schemas prevents cross-entry resolution but does not promise immediate reclamation of all previous code. No persistent compiler or result cache exists.

## Complete verification and memory

Attempt 1: `npm run verify` exited 1, 1247/1248 pass, one pre-existing Console refresh notification timeout, 260461.299042 ms. The unchanged focused real-event replay passed in 766.436458 ms. `full-retry-rationale.md` records investigation and the earlier identical failure in WI-0230; no timeout, assertion, source or concurrency was changed. The first failed attempt remains failed evidence.

Attempt 2: the identical full command on exact unchanged candidate `bcafc86e27b59207b0ec5ae78c5089e5c3c86b87` exited 0. Repository/documentation/package checks passed; 1248/1248 tests pass, zero failures/cancellations/skips/todos; test-runner duration 263941.670083 ms. The actual Console refresh assertion passed in 1620.052334 ms. `git diff HEAD -- src test scripts package.json package-lock.json .github` was empty. The pre-existing intermittent notification behavior is not diagnosed or claimed fixed; it is a separate follow-up risk, not a schema behavior change.

Passive one-second samples of the owned npm verification tree recorded 30 simultaneous processes and a 2164160 KiB RSS-sum peak in attempt 1; 29 processes and 2201680 KiB in attempt 2 (about 2.06 and 2.10 GiB). Sampling can miss short-lived peaks; summed RSS can double-count shared pages and omits full compressed/swapped/GPU allocations. No comparable baseline full-tree sample exists, so there is no full-suite RAM reduction claim. Unrelated workstation apps were excluded. Full logs, samples and monitor scripts are preserved in the task artifacts.

Distinct QA independently exercised 34 schema cases and seven complete normalized API comparisons against the original module. Final overall acceptance is recorded separately in `independent-review.md`; this developer record does not grant acceptance.
