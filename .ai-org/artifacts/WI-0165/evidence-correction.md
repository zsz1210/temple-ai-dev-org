# WI-0165 Evidence Correction

Doctor detected that `EVID-20260904T180054Z-3720C0FC` referenced an observation path whose bytes were updated after the record was created. The tested candidate and test result did not change, but the artifact digest no longer matched.

The original Evidence entry was preserved and explicitly invalidated through the Evidence CLI. `EVID-20260904T180328Z-97D4D7F0` replaces it using the immutable `quality-test-observation.json` path for the same exact candidate and clean detached-worktree run.

After replacement, Doctor reported 37 pass, zero warnings, and zero failures.
