# Complete candidate verification

Candidate: 471bdc0d76eafb2479bafd4fa4b9f2863cea69d1. Ran npm ci --ignore-scripts,
then npm run verify. Executing process exit 0; 1253/1253 passed, zero failures,
cancelled, skipped or todo. Suite duration 315230.821084 ms.

Local macOS arm64, Node 24.20.0 / npm 11.19.0. This ordinary full test environment
uses Homebrew's zlib 1.2.12; the newly isolated release-pack command correctly rejects
that compressor. Separate real packing controls use the checksum-verified official
Node build and its qualified zlib, recorded in toolchain-observations.json and the
independent QA observations. No consumer runtime constraint was narrowed.

Retained full-verification.log preserves command output with only the repository
root redacted. Implementation files stayed unchanged after candidate commit;
subsequent files are lifecycle/evidence only. Hosted Release execution and npm
publication are outside this work; the actual shell-body controls are not claimed
as a live OIDC test or a hosted performance benchmark.
