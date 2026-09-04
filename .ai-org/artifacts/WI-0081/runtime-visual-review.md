# WI-0081 runtime visual review

Date: 2026-09-01
Surface: Home-LAN read-only Management Console
URL: `http://<PRIVATE_IPV4>:41741/`

## Observations

- Overview shows current repository-backed counts and clearly separates current conditions from work that is merely in a nonterminal lifecycle state.
- Work supports real Work Item search, lifecycle and Position filters, row selection, a responsibility chain, and evidence-qualified execution/model details.
- Team renders the five configured Agent Identities and all ten Position responsibilities without presenting them as a reporting hierarchy. The People & Agents view shows Rikku's last observed `gpt-5.6-luna` evidence and reports other model states as not observed.
- Usage labels its scope as recorded repository evidence rather than a live or account-wide meter. The observed total is 23,433 Tokens from 1 qualified Work Item and 1 observation; monetary cost remains unknown.
- System separates Status, Configuration, Integrations, and Access. The home-LAN surface exposes no mutation, Inbox, Agent Command, or raw-event controls.
- History defaults to the latest 20 matching Work Items and events, with search available for older records.
- The ultrawide Overview uses the available width without stretching copy into unreadable lines. Tablet and mobile layouts produce no horizontal page overflow.

## Captures

- `output/playwright/wi-0081/live-overview-wide-fixed.png`
- `output/playwright/wi-0081/live-work-wide.png`
- `output/playwright/wi-0081/live-overview-mobile.png`
- `output/playwright/wi-0081/live-work-tablet.png`

The capture paths are local QA artifacts and are not release evidence until preserved at an exact candidate revision.

## Follow-up responsive review

- At 1440 pixels, the Work inventory uses one full-width column; all row and cell scroll widths equal their client widths, and the selected revision remains fully readable.
- At 2560 pixels, the Work inventory and detail panel return to a two-column layout with no row, cell, detail, or document overflow.
- At 390 pixels, Work rows, execution-card headings, Team summaries, Usage summaries, System tabs, and revision hashes remain inside the viewport.
- A clean browser session reported 0 console errors and 0 warnings after the final restart.
- Primary navigation lands at scroll position 0 and focuses the destination region rather than leaving a visible heading focus box.

Final local captures:

- `output/playwright/wi-0081-final/overview-1440.png`
- `output/playwright/wi-0081-final/work-1440.png`
- `output/playwright/wi-0081-final/work-2560.png`
- `output/playwright/wi-0081-final/team-390.png`
- `output/playwright/wi-0081-final/usage-390.png`
- `output/playwright/wi-0081-final/system-390.png`
- `output/playwright/wi-0081-final/work-390.png`
