# WI-0152 Developer Verification

Candidate revision: `b7e1706f01d343738d63594cba79e3b48728b87b`

Developer Agent Identity: Rikku (`agent-rikku`)

## Result

Pass. The candidate implements the approved Auditable Self-Hosting and Evidence Profile scope without changing GitHub visibility, rewriting history, publishing npm, or collecting live Provider data.

## Behavior verified

- Fresh projects receive a project-owned Evidence Profile configuration with `private` as the default.
- `private`, `public`, and `restricted` safety floors cannot be weakened through configuration.
- `temple publication audit` reads repository, package, or both surfaces and never writes canonical state.
- Reports expose rules, classifications, paths, line numbers, counts, and remediation without matched values, source lines, or fingerprints.
- Credentials, secret material, local-only runtime data, inspection failures, and new public-profile environment details block.
- A reviewed full-commit baseline retains only the counted matching repository occurrences as `review-required`; new duplicates still block and the package never inherits the exception.
- Binary files remain explicit manual-review obligations.
- Init, upgrade, schema catalog, managed checksum, project-owned preservation, and package checks include the new contract.

## Verification evidence

- `npm run verify`: 427 passed, 0 failed.
- Schema validation: 177 documents across 36 schemas, valid.
- Doctor: 36 passed, 0 failed, with the pre-existing stale generated parallel-plan warning.
- Public package audit: `allowed`; 370 files, 0 blocked, 0 review-required.
- Public repository audit: 0 blocked; 334 unchanged reviewed-baseline environment occurrences and 68 binary files remain `review-required`.
- Package-facing documentation contains no maintainer-specific home path, home-LAN address, or Tailnet hostname.

## Interpretation boundary

The repository result is intentionally `review-required`, not a certification. It proves that the candidate introduced no newly detected text blocker relative to the approved baseline and that the npm package is clean under this bounded scanner. A future public release gate must still review retained legacy evidence, render binary content, scan full history and hosted logs, inspect dependencies and licenses, and obtain separate Human publication approval.
