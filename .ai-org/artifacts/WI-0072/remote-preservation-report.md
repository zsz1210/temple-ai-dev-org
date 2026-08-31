# WI-0072 remote preservation report

Observed at `2026-08-31T15:39:21Z` against `origin` (`zsz1210/temple-ai-dev-org`).

## Published exact refs

- `refs/tags/temple/evidence/27d735d89d30915ee2399f80f85ad563477d420c` → `27d735d89d30915ee2399f80f85ad563477d420c`
- `refs/tags/temple/evidence/0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72` → `0b02e1c5de3d10aedc0f0ec64cb96af4d9de1e72`

`git ls-remote --tags origin` returned both exact mappings. GitHub's Git Commit API resolved both objects. A fresh HTTPS clone into `/tmp/temple-wi-0072-remote-clone.qNMAAm/repo`, followed by the CI-equivalent `npm ci --ignore-scripts`, resolved both commits and returned Doctor 35 pass, 1 known stale-plan warning, and 0 fail.

The first Doctor attempt before dependency installation failed only because the fresh clone did not yet contain the pinned `ajv` package; the CI workflow installs dependencies before Doctor, and the repeated CI-equivalent sequence passed.
