# Accepted usage-scope source integration

The owner authorized merging the completed usage-scope work and updating the
existing local observer on 2026-09-28. This integration carries only the accepted
source, tests and operating documentation. New private task records, host source
bindings, real usage snapshots and machine-local diagnostics remain local; their
Git ancestry is not imported into this branch.

Reviewed behavioral source: e07edf0a835830003c3db03899f2e7b1803d67cd.
Local accepted delivery: d60fcc3b3d9ba9ab594837a7e8e72951a0d8e79e.
The local native task completed distinct-Agent review and acceptance. Final source
verification passed all 166 test files, 64 focused tests and the native monitor's
8 browser checks with no external requests. Both review findings were repaired:
stopped source status and idempotent capture replay measurement.

Integration verifies exact source equivalence rather than reinterpreting those
records as a new review. The additional legacy Management Console diagnostic
remains a recorded failure for its WI-only route receiving a WK identifier; it
does not represent the native monitor. No claim of improved token efficiency or
complete historical coverage is made. Runtime deployment retains local task data
and access configuration. This merge does not publish a package or version tag.
