# WI-0171 — QA follow-up: local selection arguments

This bounded follow-up implements the advisory found during WI-0170 Independent QA. The maintainer authorized completing the verification-efficiency improvements. Scope: `scripts/test-groups.mjs` argument validation and its tests only. No external writes or publication.

Reject unknown, duplicate, or missing arguments. For the conservative changed-path helper, ambiguous options must select full verification; explicit group invocations fail clearly. Preserve valid `--base` and `--list`. Test both the parser and executable boundary. This reversible, low-risk input-validation correction is eligible for Lean delivery. Developer remains Rikku; quality review remains Lulu. WI-0170 retains the full-candidate Independent QA and final integration responsibility.
