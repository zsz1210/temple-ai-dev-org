# WI-0185 package verification

The constant now permits 402 files, accounting for the two named additions documented in WI-0184's packaging review. `node --test test/release-package.test.mjs` passed 2/2 in 0.064 seconds. `node scripts/check-package.mjs` passed with 402 files, 867,070 packed bytes and 3,407,778 unpacked bytes. Required paths, forbidden prefixes, top-level allowlist and 8 MiB size ceiling remain checked.

This is bounded Developer evidence. Complete combined-candidate verification and a distinct reviewer still belong to WI-0184. No package publication occurred. Revert this constant adjustment together with removal of its two associated package files to roll back.
