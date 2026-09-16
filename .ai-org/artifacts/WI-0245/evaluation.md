# WI-0245 evaluation

Verdict: PASS for the approved release-preparation change at
`471bdc0d76eafb2479bafd4fa4b9f2863cea69d1`.
Evaluator: agent-lulu, assigned Quality Evaluator; Developer: agent-rikku.
Assignments were independently read from the canonical assignment registry.

The coordinator confirmed completion of the exact-candidate full verification
process with exit 0. I independently inspected the retained log and its digest:
1253/1253 passed, no failed, cancelled, skipped or todo tests; duration
315230.821084 ms. SHA-256 of `full-verification.log`:
`e9cc950932769d6d1449bcce3d64d32ba5159459f8aa4751357966d5ebc48975`.
Scoped implementation and documentation files still have no diff against the
candidate. I did not repeat the complete suite or modify the implementation.

Independent focused execution passed 10/10 tests (3553.669708 ms), including
execution of the workflow's actual shell bodies with disposable transport stubs.
The early asset mismatch prevents complete verification; verification failure
prevents publication; post-verification drift prevents publication; only the valid
sequence reaches the simulated publish. Real metadata and byte validators remain
active in those controls. Release-only trigger, exact Actions pins, OIDC permission
boundary, channel mapping and complete verification remain present.

Eight independently authored temporary controls also passed; details are retained
in `qa-observations.json`. They exercised a real tiny-package pack with official
Node 24.20.0 / npm 11.19.0 / zlib 1.3.2.1-motley-42c2f19 on macOS arm64; preservation
of an existing output/archive and output symlink; rejection of a symlink parent
that resolves into the checkout; execution of both npm version and pack with the
same official Node even when PATH supplies a failing node executable; separate
Node/npm/zlib mismatches; a same-size gzip-header mutation whose decompressed
content remains identical; and a symlink used as the release asset. All owned
temporary files were removed.

No actionable defect was found. The full and focused ordinary-development suites
used Homebrew Node 24.20.0 with zlib 1.2.12, which is deliberately unsuitable for
release packing; the positive pack controls used the separate official runtime.
These results establish local behavior and workflow ordering, not an executed
hosted Release, live OIDC transaction, registry publication, runtime-origin
authentication or measured hosted time/token saving. The exact archive comparison
remains the final safeguard even when toolchain fingerprints match.

This evaluation permits the next independent candidate judgment. It does not
complete Independent QA or authorize an external release.
