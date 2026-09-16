# Developer handoff

Candidate: 471bdc0d76eafb2479bafd4fa4b9f2863cea69d1. Developer agent-rikku.

Implemented the approved release-only fingerprint, source-checkout packing helper,
early hosted byte comparison and final post-test repack comparison. Ordinary Node
support, ordinary CI, Release-only trigger, OIDC permissions and channel policy
are unchanged. The new fingerprint records compatibility rather than runtime origin
authentication. No release, tag, registry mutation or downstream upgrade occurred.

Focused release tests: 10/10 passed, 2025.819542 ms. Their workflow harness executes
the actual shell bodies with disposable npm/gh transports and the real archive/
metadata validator. It proves early mismatch prevents full tests, full-test failure
prevents publication, post-test drift prevents publication and the valid order
reaches the simulated publish. No real GitHub Release invocation is claimed.
Repository/package/link checks passed; diff whitespace check passed.

Real Homebrew rejection: 255 ms, zlib mismatch, no output directory. Official Node
packing: 1862 ms, observed exact pinned versions, existing archive preserved when
the same output was requested again. The temporary runtime download was checked
against the official SHASUMS256.txt. Package install/init/Doctor/Status/upgrade and
preservation controls passed seven groups (8710 ms summed subprocess time).
Detailed observations are in toolchain-observations.json and package-smoke.json.
These are bounded local samples, not general hosted timing or Token savings.

The complete npm run verify is running on this exact candidate after npm ci.
This handoff does not claim its result; the Test gate must remain open until the
completed full result is recorded. A distinct reviewer can independently inspect
the frozen code and exercise bounded controls meanwhile. Runtime/code changes
would invalidate the running full result and require a corrected candidate.
