# Release packaging preflight work order

The user approved the recommendation to fix the release packing environment and
detect compression mismatches before expensive hosted verification. Scope includes
implementation, deterministic checks, distinct QA and ordinary PR integration.
It excludes new releases/tags, npm uploads, channel/credential/permission changes,
real downstream upgrades, model experiments and changes to ordinary runtime support.

Baseline: 6e429face64c1f1adfdad99f6447dea29507e3e1. Standard profile, standard risk,
no UI. Developer agent-rikku, distinct reviewer agent-lulu, coordinator agent-mog.
No open Work Item overlaps were found. Relevant Learning index search returned no
release-toolchain Practice; WI-0244 compression-recovery.md supplies exact evidence.

## Acceptance and design

1. Pin the release workflow to official Node 24.20.0. Require npm 11.19.0 and
   zlib 1.3.2.1-motley-42c2f19 before any pack operation. Record platform/architecture
   and observed versions beside each archive. A matching fingerprint is compatibility
   evidence, not cryptographic proof of where a runtime was obtained; docs require
   the official distribution and its published checksum. Ordinary Node >=24 runtime
   support and ordinary CI remain unchanged.
2. A source-checkout-only release pack helper invokes npm using the current Node
   executable and its selected npm CLI, rejects incompatible tooling before output
   creation, and uses a fresh output directory to avoid overwriting qualified bytes.
   No dependency installation, environment replacement or publication is implicit.
3. Release order: install lock -> qualified pack and metadata -> download exact asset
   -> byte comparison -> complete verification -> qualified repack and final byte
   comparison -> existing OIDC publish. Early failure cannot launch full verification
   or publication; later source/asset divergence still cannot publish.
4. Retain Release-only trigger, permissions, immutable Actions, exact asset comparison,
   channel policy and full verification. Validate real incompatible runtime rejection,
   a synthetic same-Node npm invocation, genuine gzip/tar equivalence mismatch and
   workflow ordering including final recheck. Do not add timing-sensitive CI thresholds.
5. Run focused controls while editing, then full npm run verify once on the final
   behavioral candidate; distinct reviewer challenges the result. Exercise the helper
   with the checksum-verified official Node distribution, record bounded timings and
   perform a temporary package init/Doctor/Status smoke. No live publication is needed
   to qualify this release-preparation change.

Update ADR-0050 before implementing the changed release order. Documentation is for
framework maintainers and stays English. Package docs may change, but Alpha.33's
immutable published package/tag is not altered. No version bump or release is implied.

## Risks and rollback

Exact tooling pins require deliberate review when Node/npm/zlib changes. Reject an
unknown toolchain instead of silently adopting a new compressor. A final archive
comparison remains mandatory after full tests. Roll back this change through a
reviewed source revert; preserve published versions and no secret/permission changes.
