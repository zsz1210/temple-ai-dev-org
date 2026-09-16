# Alpha.33 publication acceptance

The authorized Alpha.33 publication and consumer verification are complete.
Technical candidate: 1a98048da0990c04c0cb9b02ffa5d25ad778d013; ordinary PR #102
merged it and its evidence at 2e269d67bd764d3c47df665bc9043263cf8082e8, the unchanged
Release tag target. Later changes concern evidence and lifecycle only.

- Local full verification: 1248/1248, 283474.274875 ms, distinct Independent QA PASS.
- Release attempt 1 passed its Linux full suite but correctly stopped before npm
  upload on an environment-dependent gzip mismatch. compression-recovery.md records
  the diagnosis, unchanged complete tar payload, retained original attachment and
  seven passing requalification checks. No source tag or published npm version was
  replaced; no exact-byte or verification check was weakened.
- Release attempt 2 succeeded through the unchanged OIDC workflow. Linux full
  suite: 1218 registered, 1215 passed, three documented platform/tool skips, zero
  failures, 667913.855682 ms. Archive equality passed before publication.
- npm acknowledged acceptance at 08:23:11 UTC with an explicit processing notice.
  Early E404 observations are retained. By the successful fresh-cache smoke at
  08:29:50 UTC the public registry served Alpha.33; eight checks passed, including
  download, exact integrity, installation, version, dry/real init, Doctor and Status.
  Temporary smoke resources were removed. The fixture Doctor had 36 passes, one
  warning and zero failures. These are synthetic-fixture results, not real-project setup.
- npm next is 0.1.0-alpha.33; latest remains 0.1.0-alpha.30.
- Published archive: 444 files, 998942 bytes, SHA-256
  d1d91dfb054ed68837661bf6c2fe243eba7a5ea6d7b6cb6dec8dfdb602808ace.
- Registry provenance metadata names the exact workflow, release tag, source commit
  and second run attempt, and its subject SHA-512 matches the downloaded archive.
  The package web page returned HTTP 403 to automated fetching; the public registry
  attestation endpoint supplied these observations. No separate cryptographic
  signature-verifier run is claimed.

Evidence: full-verification.md, independent-qa.md, binary-review.json,
release-attempt-1.json, release-attempt-2.json, official-archive-qualification.json,
github-release.json, registry-propagation.json, registry-smoke.json and
registry-provenance.json. Final lifecycle/CI integration observations follow in
completion-checks.md after the CLI close operation.

Rollback: immutable npm contents cannot be replaced. A defective released version
requires a separately reviewed successor/deprecation and intentional channel repair;
no real project was upgraded. The preserved original compressed attachment is
historical reference, not the npm archive.

Next recommendation: pin and record the official Node distribution and zlib in
release preparation, and compare candidate packaging before the long hosted full
suite. This would detect this exact environment mismatch earlier. Do not start
another experiment or downstream upgrade from this closeout alone.
