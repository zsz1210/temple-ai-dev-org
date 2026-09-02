# Technical design — WI-0115

Add a standalone Node.js validation runner that creates an exclusive temporary root, packs the current candidate, installs it into a clean consumer, writes a synthetic five-identity init configuration, and executes init through the installed package. The runner then uses only the target repository's `templew.mjs` launcher for Doctor and Status.

The observation records elapsed time per step, exact package and initialized-project facts, the bootstrap authority booleans, instruction-source paths, deterministic file reads performed by the runner, and an explicit provider evidence block. Provider evidence defaults to `not_run` with Token values `null`; it must never synthesize zero usage.

The runner removes its temporary root unless `--keep` is supplied. It writes only to an explicitly requested exclusive output path and fails closed on an existing output, command failure, malformed JSON, authority escalation, managed `CLAUDE.md`, or unhealthy Doctor result.
