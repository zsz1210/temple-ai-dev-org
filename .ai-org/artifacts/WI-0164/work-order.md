# WI-0164 Work Order

## Outcome

Determine whether the frozen Alpha.30 technical candidate can be distributed as one reproducible source-built package and operated through the documented AI-assisted Core Path in a clean Node.js 24 consumer.

## Approved scope

- Build exactly one npm tarball from commit `a6849519c6067b2f73ca1a44d556faf7a5168b1d`.
- Record the package filename, version, file manifest, SHA-256, npm integrity, packed size, and unpacked size without committing the tarball.
- Run repository, schema, Doctor, complete behavior, installed-Chrome browser, dependency, license, provenance, and public repository/package surface checks against the same candidate.
- Install the exact tarball in a disposable Node.js 24 consumer and run version, initialization, idempotent re-initialization, installed-package launcher override, status, and Doctor.
- Confirm the Alpha.29-to-Alpha.30 change does not require a managed-file or project-data migration beyond the version-pinned lock update already exercised by `WI-0163`.
- Record Independent QA and update the current validation and readiness pages with measured results and retained limits.

## Acceptance criteria

1. Every package and consumer result names the same technical candidate and exact tarball digest.
2. The complete package manifest and numeric sizes are retained in repository evidence, while the generated tarball and disposable consumers remain local temporary material.
3. The clean Node.js 24 consumer completes the documented deterministic path without registry access or a published package.
4. Browser and public-surface checks pass or reject the candidate with an exact finding; no source is patched during qualification.
5. No result is interpreted as automatic model execution, universal efficiency, enterprise qualification, publication approval, or npm availability.

## Stop condition

Any required source change, digest ambiguity, manifest drift, consumer failure, browser failure, public-surface blocker, or schema/Doctor failure rejects the candidate and returns to an explicit new freeze. Qualification never silently changes the source revision.

## Exclusions

- No repository visibility change, tag, GitHub Release, npm publication, deployment, or announcement.
- No new Provider/model run, performance benchmark, enterprise test, or optional Console installation.
- No committed tarball, `node_modules`, disposable consumer, or local absolute path.
