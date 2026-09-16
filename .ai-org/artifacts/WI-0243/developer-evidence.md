# Alpha.33 Developer evidence

Developer: agent-rikku. Candidate: `02103e99d45adbf1f3bcc3abbc1325658aee11d3`.
Baseline main: `721575895f6a35a04bf7284c6f4e219248b0364c`.

The complete verification is currently running; no full-suite pass is claimed by
this handoff. The evaluator must inspect its final exit code and summary before
acceptance. Independent QA may review the frozen package in parallel.

- `npm ci --ignore-scripts`: passed, Node v24.20.0.
- Repository and documentation checks pass. The reviewed package contains 444
  files, 997361 packed bytes and 3874046 unpacked bytes; only the new public guide
  expands the previously reviewed file count. The allowlist and size limit remain.
- Archive SHA-256: `03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2`.
  The archive was first built at e27038c7; the subsequent candidate changes are
  restricted to the excluded evidence harness and package-check script. Independent
  QA must reproduce identical bytes from the exact final candidate.
- Published Alpha.32 downloaded from npm has SHA-256
  `44efc2ce60a714ec73613affbcb7748a14ab7a96b892660e8cf4113372dd26c2`, matching
  the GitHub Release asset digest. npm next remains Alpha.32; latest remains Alpha.30.
- `qualification.json`: seven groups pass; all 31 pre-existing project-owned files
  are unchanged after Alpha.32 upgrade, including agents, assignments, collaboration,
  work/event history, custom AGENTS/CLAUDE and application content. Managed conflict
  exits 1 with zero file changes. All owned temporary directories are removed.
- Initial harness attempts are retained separately. They rejected expected generated
  view and native integration-receipt changes; the final harness asserts exact
  project/managed bytes and permits only the documented receipt changes in the lock.
- Package publication audit: 444 text files, zero blocked/review-required items.
- Production dependency audit: zero reported vulnerabilities (dated observation).
- No UI implementation or markup changes; PR100's exact browser evidence remains
  the relevant previous UI measurement. No broader browser claim is made here.
- No paid model run or Token comparison; timings in qualification.json are local
  diagnostics under full-suite load, not general performance measurements.

## Boundaries and next owner

Distinct QA agent-lulu must verify metadata, source/archive equality, downstream
preservation and full-suite results. Candidate preparation must not publish a tag,
Release or npm version, change repository permissions, or upgrade a real project.
The package audit does not certify all historic repository artifacts; existing
historical binary and local-path review limits remain separate.
