# Developer report — WI-0045

- Candidate revision: `fbb6aa965baf1f7bbd6e4721e9735ddd4d882bbe`
- Developer: Rikku (`agent-rikku`)
- Decision: ready for Test

## Change

Dashboard attention normalization now treats current firing recovery conditions as operational work. All firing `stale-evidence` conditions are grouped into one bounded signal that reports the underlying count, appears ahead of release bookkeeping, and links directly to the System view. Other firing conditions remain individual signals, and explicit runtime permission requests still retain the highest priority.

The Now hero uses the normalized underlying count instead of the number of rendered cards. This preserves a concise interface while preventing ten recovery conditions from being misrepresented as one minor item or hidden behind nine release decisions.

## Verification

- Focused Control Plane, Inbox, live-observer, and private-viewer tests: 34/34 pass.
- Complete repository verification: 222/222 pass, with repository and documentation link checks passing.
- Home-LAN private Chromium at 1024 × 1366: one grouped attention card, ten underlying firing stale-evidence conditions, zero local-only tools, and no document-level horizontal overflow.
- The primary recovery action changes the URL to `#system`; System displays all ten underlying firing stale-evidence rows.
- Mobile Chromium at 420 × 900: sticky horizontally scrollable navigation, one grouped recovery card, and no document-level horizontal overflow.
- Fresh browser console: 0 errors and 0 warnings.

The transient browser screenshot and Playwright state are inspection aids only and are not canonical evidence.

## Boundaries retained

The change does not clear or mutate stale evidence, approve a release, enable remote commands, or invent Token or cost data. It changes only how existing canonical conditions are summarized and routed for review.
