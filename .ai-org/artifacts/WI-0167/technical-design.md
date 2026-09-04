# WI-0167 Technical Design and Risk Review

## Adapter remediation

Use the official Archify `v2.16.0` tag at commit `c826e6c3a7abad19c0f3cd1ca57207d54b1ad8de` as the clean, licensed upstream base. The release already carries an explicit `fast-uri` override, but its pinned `3.1.5` is below the versions fixed for the six current GitHub advisories.

Temple therefore applies one data-only downstream patch during installation:

- update `archify/package.json` override `fast-uri` from `3.1.5` to `3.1.7`;
- update the matching lock entry to the npm registry URL and integrity published for `3.1.7`;
- perform no dependency installation, network request, source execution, or arbitrary patch command;
- fail closed unless every expected pre-patch value matches;
- record the patch descriptor beside upstream provenance in the installed manifest before hashing all files.

The default adapter inspector requires both the exact upstream provenance and the exact ordered patch descriptors. Tests cover clean patched installation, patch precondition rejection, digest drift, dirty-source rejection, and unrecorded files.

## Release construction

Remove `private: true` only after the package remains constrained by its existing `files` allowlist. Add public `publishConfig` with dist-tag `next`. Build one tarball from the final candidate revision, retain its complete npm manifest and SHA-256, and install that exact file into a clean temporary consumer before any external publication.

The GitHub prerelease tag and npm version must identify the same Git revision and package bytes. npm publication uses the prebuilt verified tarball rather than rebuilding from a later working tree.

## Risk and rollback

- If the downstream patch preconditions drift, installation fails instead of guessing at a replacement.
- If the adapter fails verification, remove the optional installed adapter; do not restore the vulnerable copy as a trusted default.
- If repository or package qualification fails, do not create either public prerelease surface.
- If GitHub prerelease creation succeeds but npm authentication or publication fails, retain the GitHub prerelease and exact tarball evidence, then resume only the npm step without changing bytes.
- An npm version is immutable. A defective publication is deprecated and its dist-tag is removed rather than silently replaced.
- Organizational closeout records readiness; it does not itself grant external authority beyond [the owner approval](owner-approval.md).
