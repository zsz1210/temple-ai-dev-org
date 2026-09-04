# WI-0163 Technical Design

## Version identity

Update the current release identity in:

- `package.json` and the root package entry in `package-lock.json`;
- `src/constants.mjs`;
- current-version upgrade and installation assertions in the test suite; and
- the toolkit self-host `temple.lock` through the repository-local upgrade implementation.

Historical validation records keep their original Alpha.29 references. They are evidence about an earlier candidate, not current version metadata.

## Candidate documentation

- Add `docs/validation/alpha-30-candidate-freeze.md` as the concise current candidate contract.
- Add it to the validation index while retaining the Alpha.29 record as historical evidence.
- Add a factual Alpha.30 section to `CHANGELOG.md` summarizing capabilities shipped since Alpha.29 without universal outcome claims.
- Refresh `docs/planning/release-readiness.md` so its current answer, gate table, and next action match the approved Alpha.30 freeze.

## Candidate identity

The first implementation commit after all version and documentation checks pass becomes the technical candidate. WI-0163 Independent QA verifies that exact commit. Later lifecycle evidence is repository-only follow-up and does not silently redefine the technical candidate.

WI-0164 will separately build and qualify the exact package archive from that commit. It may reject the candidate and require a new freeze; it cannot silently patch or repoint it.

## Self-host upgrade boundary

Changing `TEMPLATE_VERSION` temporarily makes the Alpha.29 launcher reject the Alpha.30 repository CLI. During that bounded transition, run the exact repository-local `bin/temple.mjs upgrade` implementation to update only checksum-clean managed files and the lock. Once the lock reaches Alpha.30, return to `node ./templew.mjs` for lifecycle mutations. No global or network-fetched CLI is used.

## Publication boundary

The freeze changes internal candidate identity only. `private: true` remains, the repository stays private, and no tag, Release, npm publication, deployment, or announcement is performed.
