# Technical design — WI-0117

The reusable Wave 5A setup and runner receive an optional `--protocol-path`; their default behavior and historical inputs remain unchanged. The Wave 5B protocol points to the already-frozen WI-0106 case fixtures, pins the integrated framework revision, selects Luna Medium, and supplies stricter operational and time ceilings.

Candidate generation uses the existing direct App Server transport, exact schema preflight, isolated child threads, structured completion, allowlisted local tools, hidden acceptance, Git inspection, detailed usage, and arm-neutral export.

After four packages exist, `scripts/run-wave-5b-evaluator.mjs` creates an exclusive evaluator directory containing only copied blind packages and frozen rubrics. It starts a fresh ephemeral App Server thread with no coordinator path, mapping, condition, usage, candidate revision, or network access. The coordinator writes the returned score artifact, validates the manifest-bound freeze record through `validate-wave-5b-protocol.mjs`, and only then joins sealed mappings.
