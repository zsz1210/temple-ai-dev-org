# Developer evidence — WI-0026

- Developer revision: `ae3743911382eefd784263bdee953b258e34bc83`
- Integrated Alpha.27 candidate: `7dda4c6b3e1fc9fd16b1fcc55b794e1f1c5d5de5`
- Focused federation and installation tests: 11/11 passed
- Integrated Phase 4 focused tests: 43/43 passed
- Integrated full verification: 193/193 passed
- Runtime schema validation: valid
- Doctor: 35 pass, 1 stale-plan warning, 0 fail

Fresh init seeds the empty project-owned federation registry through overlay walking. Upgrade exclusively creates a missing registry and preserves an existing registry byte for byte; the registry never enters `managed_files`. Alpha.27 ships both strict Draft 2020-12 schemas and all six capability flags. The explicitly approved `src/install.mjs` scope correction adds only those six fresh-init flags.
