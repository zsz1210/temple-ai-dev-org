# Archify adapter

Archify is an optional isolated third-party adapter. Temple remains fully usable when it is absent.

## Pinned contract

- Repository: `tt-a1i/archify`
- Tag: `v2.15.0`
- Commit: `e1ac748f19cf805e44bf74fb93c796662152e273`
- License: MIT

The installer performs no network request. First obtain that exact Git checkout through an authorized process, then provide its local path:

```bash
node ./templew.mjs adapter archify-status .
node ./templew.mjs adapter archify-install . --source /absolute/path/to/archify-checkout --json
node ./templew.mjs adapter archify-status . --json
node ./templew.mjs doctor .
```

The source must resolve to the pinned commit, have no modified, untracked, or ignored content under `LICENSE` or `archify/`, and contain the expected license, Skill, CLI, and schema entrypoints. Installation copies only the licensed Archify distribution into `.ai-org/adapters/archify/v2.15.0/`, records every file digest and provenance field, and never modifies Work Items, Assignments, evidence gates, or approval state.

`archify-status` returns `not_installed`, `installed`, or `invalid`. Absence is a safe optional state. Missing or unrecorded files, symbolic links, provenance drift, or a digest mismatch makes the adapter unusable and causes `doctor` to fail until the project repairs or deliberately removes the invalid installation.

Installing the adapter does not execute Archify, generate architecture truth, contact a network, or authorize any external action. Generated visuals remain projections of selected canonical sources.
