# WI-0245 Independent QA

Verdict: PASS for candidate `471bdc0d76eafb2479bafd4fa4b9f2863cea69d1`.

Reviewer: agent-lulu. Developer: agent-rikku. Their distinct identities are
confirmed in `.ai-org/project/assignments.json`. Fresh context resolution confirms
the Standard-profile item is at Independent QA, owned by agent-lulu under claim
`claim-20260916085632-15860fa1`, with handoff-002 naming this same candidate.
No scoped implementation or documentation change occurred after its verification.

The independent candidate judgment accepts all approved requirements:

- Release packaging requires and records the qualified Node/npm/zlib fingerprint;
  each incompatible version fails closed and cannot produce a qualified archive.
- A real official-runtime pack succeeds. Both npm subprocesses use the current Node
  even with a hostile PATH. Existing output bytes remain intact, including symlink
  cases, and an output alias into the source checkout is rejected.
- The actual workflow shell bodies reject an early asset mismatch before complete
  verification. Failed verification and late archive drift each prevent simulated
  publication. Valid ordering retains both full verification and the final exact
  compressed-byte comparison, Release-only trigger and existing OIDC boundary.
- Identical inflated contents, identical compressed size, or a symlink cannot
  substitute for an identical regular-file archive.
- The full candidate suite completed with exit 0 and 1253/1253 passes. The retained
  log and its digest were independently inspected; independent focused execution
  passed 10/10 tests, plus eight separately authored counterexample controls.

Exact measurements, environments, full-log SHA-256 and counterexamples are retained
in `evaluation.md`, `qa-observations.json` and `full-verification.md`; those records
are reused without rerunning unchanged checks. The reviewer made no implementation
repair and removed all owned test fixtures.

No blocking defect remains within this scope. These are local macOS controls and
simulated workflow transports, not a newly executed hosted Release or live npm/OIDC
publication. Matching fingerprints do not authenticate runtime origin or remove the
final byte comparison. No external mutation, publication or downstream upgrade is
authorized by this verdict. Next owner: Release Manager for bounded closeout and
ordinary source integration under the existing authorization.
