# Archify adapter contract

Phase 1 treats Archify as an optional read-only visualization adapter, not a core Temple dependency.

Current state: `contract-only`.

- The MIT License has been verified.
- Upstream `v2.15.0` and its resolved commit are pinned.
- Readable inputs, generated-artifact-only writes, provenance, and prohibited authority are defined.
- Upstream code has not been vendored, installed, or executed.

Before enabling the adapter:

1. Obtain the release artifact with a fixed checksum.
2. Validate its input schema and HTML output in an isolated sample repository.
3. Add supply-chain, license, visual-QA, and graceful-degradation tests.
4. Enable it explicitly with `temple integration enable archify`; init must not enable it by default.

Temple's `doctor`, `status`, workflow, and decision records must work whether or not the adapter is present.
