# Archify adapter contract

Alpha.19 implements Archify as an optional, isolated, locally sourced adapter, not a core Temple dependency.

Current state: `opt-in-isolated`.

- The MIT License has been verified.
- Upstream `v2.16.0` and its resolved commit are pinned.
- A reviewed deterministic `fast-uri` `3.1.7` security patch is recorded separately from upstream provenance.
- Readable inputs, generated-artifact-only writes, provenance, and prohibited authority are defined.
- Default init does not vendor, install, download, or execute upstream code.
- An explicit install accepts only a clean local checkout at the pinned commit, applies only the exact declared data patch, and records the complete copied file set and every digest.

To install the adapter:

1. Obtain the exact pinned checkout through an authorized process.
2. Run `node ./templew.mjs adapter archify-install . --source /absolute/path/to/checkout`.
3. Run `adapter archify-status` and `doctor` to verify provenance and digests.

The installer copies the distribution under the project-owned `.ai-org/adapters/` boundary. It does not contact a network, run a package manager, execute Archify, or change canonical lifecycle state. Temple's `doctor`, `status`, workflow, and decision records work when the adapter is absent. See [the adapter guide](../../docs/extensions/archify-adapter.md).
