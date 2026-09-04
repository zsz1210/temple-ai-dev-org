# WI-0164 Quality Evaluation

- Quality Evaluator: Lulu (`agent-lulu`)
- Frozen technical candidate: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Exact package SHA-256: `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`
- Result: **Pass to Independent QA**

## Acceptance evaluation

1. **Exact identity — pass.** One Alpha.30 package is bound to the frozen source by revision, version, filename, SHA-256, npm integrity, SHA-1, 380-entry manifest, and byte sizes.
2. **Repository and presentation — pass.** The candidate passed all 443 tests, schema validation, Doctor with zero failures, and the installed-Chrome browser gate.
3. **Dependency and publication surfaces — pass with retained binary boundary.** Both dependency audits found zero known vulnerabilities. The public repository/package audit found zero blockers; 68 binaries remain explicit digest-reviewed items, and one adapter fixture remains exact-provenance allowed.
4. **Clean consumer — pass.** Node.js 24 installed the exact local archive and completed version, first init, repeated init, installed launcher, status, and Doctor without failure.
5. **Upgrade safety — pass for the changed boundary.** The Alpha.29 comparison required only a lock update; 15 sampled project-owned file digests remained unchanged and upgraded Doctor had zero failures.
6. **Authority separation — pass.** Candidate source and every publication surface remained unchanged. The record makes no universal efficiency, automatic routing, enterprise, or public-registry claim.

## Independent QA focus

Independently rerun the same sealed qualification runner, require the same package SHA-256 and complete manifest, and compare all normalized results. A different archive digest or any failed source, browser, consumer, upgrade, audit, schema, or Doctor check is a no-go.
