# WI-0159 Developer Verification

- Developer: Rikku (`agent-rikku`)
- Exact candidate: `fea56220c4ac4f921eb23779c3ee50cc2a29c328`
- External publication action: none

## Delivered

- Replaced four maintainer home-directory values and two concrete disposable tarball paths with semantic placeholders in the current tracked artifacts.
- Added a non-identifying redaction manifest that binds each current replacement to the original immutable Git revision, blob ID, and SHA-256 digest.
- Preserved all original WI-0155 and WI-0156 Evidence entries without invalidation or re-certification.
- Updated human-facing release-readiness documentation to distinguish current-tree cleanliness from historical Git exposure.

## Exact-candidate verification

- A clean detached worktree at the exact candidate installed the locked dependencies successfully.
- `npm run verify` passed: repository, documentation-link, and package checks plus 434/434 Node tests.
- Package boundary: 375 files, 806,936 packed bytes, and 3,200,204 unpacked bytes.
- Doctor: 36 passed, 1 warning, 0 failed. The warning is the existing stale generated parallel plan and does not affect sequential WI-0159.
- Public Evidence Profile audit: 0 blocked findings across repository and package surfaces; 402 repository occurrences remain review-required across 330 retained-legacy finding records and 68 binary files.
- The detached candidate remained clean.

## Non-candidate setup event

The first detached attempt used npm's `--prefix` option with a random worktree name. npm treated that directory basename as a lockfile package identity, refused installation, and no candidate test ran. The valid run used the detached worktree as the process working directory. No lockfile or candidate file was changed.

## Remaining boundary

The current tree is free of blocked public-profile findings. Historical commits still contain the old values. Accepting that already-shared history or authorizing a destructive history rewrite remains a separate Human decision before publication.
