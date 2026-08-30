# Developer evidence — WI-0019

- Integrated candidate: `0d48f087b12dfa1b96d4f3bb5ed73375cb67407c`
- Release line: `0.1.0-alpha.27`
- Focused CLI and installation tests: 7/7 passed
- Full verification: 193/193 passed
- Schema validation: 45 documents, 24 schemas, 0 errors
- Doctor after provenance correction: 35 pass, 1 stale-plan warning, 0 fail

Alpha.27 integrates Phase 4 recovery, audit, usage qualification, repository federation, and generated portfolio contracts. The accepted `--root` and `--allowed-root` CLI boundaries are implemented; the actual `.ai-org/views/portfolio.json` output is schema-cataloged. Existing project-owned federation state is preserved byte for byte and never enters `managed_files`.

No push, publication, deployment, external tracker mutation, account probe, paid model call, or model switch occurred.
