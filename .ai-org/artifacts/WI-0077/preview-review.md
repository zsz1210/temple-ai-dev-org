# Preview review — WI-0077

## Artifact

- Interactive preview: `management-console-preview.html`
- Delivery mode: preview-first
- Baseline: `UI-0002@ui-1`
- Production Console changed: no

## Owner decision

- Decision: **design direction accepted for Build planning**
- Confirmed on: **2026-09-01**
- Accepted direction: dark engineering shell, restrained running-state motion, System-local view-only Configuration, eye icon plus `View only`, responsive layout, and no lock icon.
- Authority boundary: this decision approves the design baseline and the preparation of an implementation plan. It does not authorize production Console changes, task dispatch, deployment, release, or publication.
- Evidence boundary: task-based usability comparison has not run. The acceptance records owner preference and comprehension of the preview; it does not yet prove reduced task time, lower error rate, or lower Token use.

## Visual evidence

| View | Viewport | Screenshot |
| --- | ---: | --- |
| Overview | 2560 × 1080 | `output/playwright/wi-0077/proposed-overview-wide.png` |
| Work | 2560 × 1080 | `output/playwright/wi-0077/proposed-work-wide.png` |
| Team | 2560 × 1080 | `output/playwright/wi-0077/proposed-team-wide.png` |
| Usage | 2560 × 1080 | `output/playwright/wi-0077/proposed-usage-wide.png` |
| Overview | 1024 × 768, full page | `output/playwright/wi-0077/proposed-overview-tablet.png` |
| Team | 1024 × 768, full page | `output/playwright/wi-0077/proposed-team-tablet.png` |
| Work | 390 × 844, full page | `output/playwright/wi-0077/proposed-work-mobile.png` |
| Work | 320 × 720, full page | `output/playwright/wi-0077/proposed-work-320.png` |
| Overview · running replay | 2560 × 1080 | `output/playwright/wi-0077/proposed-overview-running-wide.png` |
| System · Configuration | 2560 × 1080 | `output/playwright/wi-0077/proposed-system-configuration-wide.png` |
| System · Configuration | 1024 × 768, full page | `output/playwright/wi-0077/proposed-system-configuration-tablet.png` |
| System · Configuration | 390 × 844, full page | `output/playwright/wi-0077/proposed-system-configuration-mobile.png` |
| System · Configuration | 320 × 720, full page | `output/playwright/wi-0077/proposed-system-configuration-320.png` |

## Verified observations

- The wide layout uses parallel comparison space without stretching the page purpose into a full-width paragraph.
- The tablet layout retains a 72 px icon rail and reduces multi-column content without losing navigation.
- The mobile layout uses a drawer, one-column inventory, and stacked selected-item detail.
- At 320 CSS px, `document.documentElement.scrollWidth` equals `window.innerWidth`; no horizontal overflow was observed.
- The private-view preview contains no `Agent Commands` label or local Action Center.
- Browser inspection reported zero console errors and zero warnings after a fresh load.
- The accessibility snapshot exposes headings, navigation buttons, search, selects, tabs, and Work Item buttons with readable names.
- The scenario selector distinguishes current state, a historical running replay, and a one-time just-updated acknowledgement. The running replay names WI-0056 and states that it is not current project state.
- Normal motion uses the `activity-pulse` animation only on the running indicator and a thin activity trace. With `prefers-reduced-motion: reduce`, computed `animation-name` becomes `none` and the state remains readable.
- System tabs switch deterministically among `Status`, `Configuration`, `Integrations`, and `Access`; exactly one System panel remains visible.
- Configuration shows effective value, provenance, and operational effect without disabled mutation controls.
- The interface contains no lock emoji, lock symbol, or lock icon. View-only state uses an eye icon plus text.
- After the mobile top-bar correction, both `document.documentElement.scrollWidth` and `document.body.scrollWidth` equal `window.innerWidth` at 320 CSS px.
- Browser inspection again reported zero console errors and zero warnings after the motion, System-tab, and responsive checks.

## Known prototype limits

- Navigation and tab selection are demonstrable, but most filters and selected Work Item content are illustrative rather than data-driven.
- The local/private selector demonstrates access treatment; it does not grant or exercise authority.
- Running and just-updated scenarios are review fixtures, not a live runtime feed.
- The prototype uses a bounded set of current repository examples and does not prove large-data performance.
- Visual review is not user-task validation. The task-based validation plan remains required before claiming usability improvement.

## Review boundary

The owner accepted this preview as the planning baseline. The design package may now be used to define a bounded production slice, but Build remains a separate authorization and the task-based validation plan remains pending.
