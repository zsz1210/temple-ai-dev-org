# Developer evidence — WI-0023

- Developer revision: `87c9b7a7e50d8431b6dc63c0b1d41963c52e3240`
- Integrated candidate: `db40145cee3f1ca7bfa3925cdfcfeb38b8844b9b`
- Focused federation tests: 7/7 passed
- Integrated full verification: 185/185 passed
- Doctor: 35 pass, 1 stale-plan warning, 0 fail

Every federation Git subprocess now disables replacement-object resolution. The exact A/B `git replace` attack remains at expected HEAD A but degrades the participant to unknown when its replacement-aware working tree does not match literal A; content from B is not projected. No remote repository, hosted identity, distributed lock, or external release was used.
