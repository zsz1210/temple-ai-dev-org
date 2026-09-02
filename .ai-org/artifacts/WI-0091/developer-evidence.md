# WI-0091 Developer evidence

## Candidate

- Implementation revision: `67e99153edd960845f051dc6e28fda693770bbef`
- Live-proof runner revision: `c60a2d275f454f567c3a1dbf7e3a75753d4b794f`
- Developer Agent Identity: Rikku (`agent-rikku`)
- UI delivery mode: `code-first`

## Implemented boundary

- Added a current capture-health projection separate from historical evidence.
- Added `capturing`, `ready-no-live-task`, `historical-only`, and `not-capturing` states with bounded reasons and Provider capability evidence.
- Added last successful capture time, eligible live-task count, and completed-Work-Item coverage to the Usage view.
- Kept account activity, repository events, and missing observations from being inferred as project Token usage.
- Documented that LAN viewing does not silently enable Codex observation.

## Verification

| Check | Result |
| --- | --- |
| Focused Node tests | 28 passed, 0 failed |
| Full `npm run verify` | Repository, documentation, package, and 270 tests passed |
| Real-browser matrix | Four viewports, six primary views, and reduced motion passed |
| Schema validation | Valid, zero errors |
| Doctor | 35 passed, one existing warning, zero failed |
| Bounded Luna proof | Passed; 24,293 new Tokens correlated to WI-0091 |

The live proof increased the real Usage total from 23,433 to 47,726 and the detailed observation count from one to two. Because the bounded Provider process then stopped, the current state truthfully returned to `historical-only` rather than pretending that capture remained live.

## Boundaries retained

- No public release, deployment, push, account-wide allocation, price lookup, cost claim, savings claim, or automatic routing occurred.
- No Provider was silently enabled by the LAN viewer.
- The live proof used one turn and zero retries.
- Screenshots remain local test output and are not package or framework payloads.
