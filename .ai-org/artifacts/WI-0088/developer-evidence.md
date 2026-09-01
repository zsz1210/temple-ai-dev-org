# WI-0088 Developer Evidence

## Candidate

- Revision: `1a82106c9fdc61efaa3aa502be320432c0bf82bf`
- Developer Agent Identity: Rikku (`agent-rikku`)
- UI delivery mode: `not-applicable`; this Work Item adds verification infrastructure and does not redesign the Console.

## Implemented boundary

- Added exact development dependency `playwright-core@1.62.1` with Apache-2.0 provenance.
- Added a live loopback browser harness using installed Google Chrome and ephemeral state/profile data.
- Covered 390x844, 768x1024, 1440x1000, and 3440x1440 across Overview, Work, Team, Usage, System, and History.
- Added semantic checks for navigation, live data, runtime errors, mobile sidebar behavior, keyboard tabs, reduced motion, overflow, clipping, and named layout overlap.
- Added the browser gate to the existing Node.js 24 full CI lane only; no new job or browser download was added.

## Local results

| Command | Result |
| --- | --- |
| `node --test test/console-browser-contract.test.mjs test/ci-scope.test.mjs` | 17 passed, 0 failed |
| `npm run test:browser` | Chrome 152.0.7977.65; 4 viewports x 6 views passed; reduced-motion passed |
| `npm run verify` | Repository, documentation, package boundary, and 268 tests passed |
| `node ./templew.mjs schema validate . --json` | Valid; 0 errors |
| `node ./templew.mjs doctor . --json` | 35 passed, 1 warning, 0 failed |

The first browser run correctly produced a bounded failure screenshot, but the failure exposed a harness timing error rather than a UI defect: the mobile sidebar state changed before its 180 ms transform completed. The harness now waits for the rendered sidebar position before asserting or continuing. The complete real-browser matrix passed after that correction.

## Boundaries retained

- No Chrome/Chromium binary was installed, downloaded, vendored, cached, or packaged.
- No user Chrome profile was opened.
- No external provider, command gateway, release, or public action ran.
- The previous Alpha.29 candidate is stale after the lockfile change and must be revalidated or superseded before any future publication.
