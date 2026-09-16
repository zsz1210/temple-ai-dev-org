# Alpha.33 publication observations

PR #102 merged normally at 2e269d67bd764d3c47df665bc9043263cf8082e8.
Required PR CI 35070733132 and main CI 35070778545 passed. The last evidence-only
check passed 53/53 after translating a quoted approval into English to satisfy
the repository language policy; its meaning and authority did not change.

The reviewed GitHub draft had tag v0.1.0-alpha.33, that exact merge target,
prerelease true, and one asset: zsz1210-temple-ai-dev-org-0.1.0-alpha.33.tgz.
The downloaded draft asset was byte-identical to the retained qualified archive:
997361 bytes, SHA-256 03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2.
Release publication was observed at 2026-09-16T07:53:16Z, starting the unchanged
Release-only workflow 35070834620. This observation alone does not establish npm
publication or a successful consumer installation; final results are separate.

An accidental prepublication invocation of registry-smoke.mjs with `--help`
treated that argument as its output filename. It made one read-only registry
query at 07:52:05Z, received the expected E404 for the still-unpublished version,
and removed its owned scratch directory. No install, initialization or registry
write occurred. The generated diagnostic was retained locally; this is not a
post-publication failure or acceptance result. Subsequent use passes an explicit
output path after the release workflow completes.

The final closeout continues on codex/alpha33-publication-closeout to retain
actual registry evidence through a second ordinary PR. After merging, the original
claim was released and the same Release Manager claimed the closeout branch at the
merged revision through the CLI; no competing ownership is introduced.
