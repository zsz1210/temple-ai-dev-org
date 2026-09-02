# WI-0114 product specification

After `temple init`, Temple reports a versioned bootstrap-required contract that tells an Agent to start a fresh session or explicitly read canonical sources before using read-only orientation commands. The report distinguishes session loading and comprehension from lifecycle authority; it grants neither.

For Claude-compatible entrypoints, an absent `CLAUDE.md` becomes exactly `@AGENTS.md` followed by one newline. Compatible existing imports remain byte-for-byte unchanged. Incompatible existing files remain untouched and receive a project-owned pending-merge snippet at `.ai-org/project/CLAUDE.temple.md`.

Human and JSON outputs expose the same material state. Dry runs write nothing. Conflicts and after-plan races fail closed. Re-init is idempotent and preserves project ownership.
