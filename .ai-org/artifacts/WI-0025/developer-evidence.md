# Developer evidence — WI-0025

- Developer revision: `6c29ca71dfca8eb164b48feb6269dc696edbf6a7`
- Integrated Alpha.27 candidate: `7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5`
- Focused Phase 4 CLI tests: 3/3 passed
- Integrated Phase 4 focused tests: 43/43 passed
- Integrated full verification: 193/193 passed
- Schema validation: valid
- Doctor: 35 pass, 1 stale-plan warning, 0 fail

The CLI now exposes consent-bound retention, bounded audit export, federation validation, and coordinator-owned read-only portfolio generation. Tests cover missing consent, stale plan digests, exclusive audit output, invalid registries, no-write behavior, coordinator-only writes, and unchanged participant hashes. No external action occurred outside disposable local backup deletion tests.
