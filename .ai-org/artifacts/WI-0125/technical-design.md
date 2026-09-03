# Technical design — WI-0125

Replace the absolute fallback with a required argument lookup. Reject absence before resolving output paths or reading approval state. Add a child-process regression that invokes the public script without `--lab-root`, expects a non-zero exit, and verifies the named argument in stderr. Existing tests already exercise explicit temporary roots.
