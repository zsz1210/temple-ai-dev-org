# Exact-asset first-package bootstrap

The owner authorized the existing WORKKEEL package/repository/workflow relationship,
without creating custom tokens or broadening another repository's permissions.
The registry must contain a package before its Trusted Publisher can be configured.
The first authenticated upload can therefore precede GitHub Release publication.

The Release job still validates metadata, qualified toolchain, retained asset bytes,
complete source verification and post-test repacking. Before uploading, it reads
the exact registry version. Only HTTP 404 permits normal publish intent. An existing
version skips upload only after exact name/version, SHA512 integrity, SHA1 shasum,
fixed-registry tarball URL, downloaded raw bytes and intended channel all match.
Authentication, network, redirects, malformed responses and any mismatch fail closed.
After either path, the same checks require the version to exist. Upload errors are
never ignored. Missing versions use the existing OIDC path; no token fallback exists.

GitHub executes the workflow present at the Release's associated commit. This
guard cannot affect a Release fixed to an earlier commit containing the old workflow.
The prepared Beta.1 target stays c542a560ecdaac470b79b2b12c336fa40e2dbbfb until the
owner resolves that constraint. Adopting this guard for Beta.1 requires a newly
reviewed, never-published target with this workflow, while independently proving
that the version and original tarball remain unchanged. It never moves a published
tag or replaces a registry version. Future ordinary releases continue through OIDC.

Source: [GitHub workflow trigger semantics](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows#workflow-triggers).
