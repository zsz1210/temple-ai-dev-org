# WI-0244 quality evaluation

Evaluator agent-lulu; Developer agent-rikku. Current assignments and the prepared
claim confirm distinct identities. Candidate
`1a98048da0990c04c0cb9b02ffa5d25ad778d013`, base
`5106bf13c0dc006f60d227ee2156e15d88c8ea52`; Darwin arm64, Node 24.20.0,
npm 11.19.0. Result: PASS for quality evaluation.

## Independently reproduced checks

- All 110 scanner binary reminders equal the reviewed tracked paths and candidate
  SHA-256/byte counts. The 68 prior PNG digests exactly match WI-0160's reviewed
  inventory; its independent report confines approval to those exact bytes.
- Independently viewed WI-0230/ui-runtime.png. It contains synthetic WI-9900 through
  WI-9905 states and generic framework labels, with no visible private information.
  PNG chunks contain IHDR, IDAT and IEND only. This is publication-image review,
  not a claim of new browser runtime validation.
- Independently read all 41 archives in bounded memory: 197 expanded entries,
  safe regular files/directories, no extraction or execution. Current expanded
  text has zero unresolved disclosure-pattern matches. Forty-two already-redacted
  or fixture/runner home markers remain recognized as placeholders.
- Compared original base Git bytes with all twelve changed public archives.
  All 53 retained members equal exactly the documented substitutions: 2766 home
  occurrences and four email literals. All 47 removed records have AppleDouble
  magic and recorded original hashes. Owner metadata and archive header timestamps
  are cleared, with regular-file/directory modes normalized. No other payload,
  assertion or numeric-measurement changes occurred. Original history is retained.
- The three text changes are limited to the equivalent relative helper import and
  rewording two references to existing redaction placeholders. The helper passes
  Node syntax checking and its repository-relative target exists.
- No changed public evidence path is referenced by the current normalized Evidence
  registry. Source, tests, packaged documentation, dependencies and package metadata
  are unchanged from the base. Historical judgments are not rewritten.
- Fresh npm pack reproduces 444 files, 997361 bytes, SHA-256
  `03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2`,
  byte-identical to the qualified Alpha.33 candidate archive.
- Fresh public repository/package audit: zero blocked findings; all 110 binary
  reminders remain review-required. Manual digest-bound review complements that
  result; it does not convert scanner reminders into automatic approvals.

## Full verification and remaining gate

Parent-owned exact-candidate npm run verify completed exit 0: 1248 tests passed,
zero failures/cancellations/skips/todos, 283474.274875 ms. Independently inspected
full-verification.md and the retained full-verification.log; its SHA-256 is
`f91fb238213518ae07123e7a05c41ca9c41c3286ae6ba5e652bc0e0ff2312271`.
This uses the single full run; independent archive, package and publication checks
above were executed separately by this evaluator.

Separately reviewed and syntax-checked the post-candidate registry-smoke.mjs
evidence harness. It pins exact Alpha.33/hash, next Alpha.33 and unchanged latest
Alpha.30, compares registry integrity, installs into an owned disposable fixture,
checks CLI/init/Doctor/Status, and removes that fixture in finally. Its registry
commands are read/download only. It has not been executed and supplies no present
publication claim; it changes no packaged runtime or test source.

No defect found in this bounded review. Ready for formal Independent QA handoff.
Release Gate, publication and registry verification remain future stages. See
qa-observations.json for independent observation counts and method.
