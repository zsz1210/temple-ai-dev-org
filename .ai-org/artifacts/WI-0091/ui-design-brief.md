# UI Design Brief — WI-0091

- Work item: `WI-0091`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Selected tool or medium: executable Temple Workspace Usage view
- Artifact path or URL: `src/control-plane-dashboard.mjs`
- Artifact revision: exact Developer candidate, recorded after Build
- Approval record, when required: not required for this bounded local read-only change

## Why this mode

The Usage information architecture, responsive shell, dark engineering theme, and read-only access boundary already exist. This change corrects state hierarchy and explanatory copy inside one established view. Code-first is proportionate because the executable page is the fastest reliable way to inspect real content density across wide, tablet, and mobile widths; runtime visual review remains mandatory.

## Required surfaces and states

- Surface: Temple Workspace `Usage` view in loopback and private read-only modes.
- Capturing: Provider ready with at least one live-resumable registered task.
- Ready: Provider ready with no eligible active task.
- Historical only: retained observations with current capture unavailable or disabled.
- Not capturing: no retained observation and current capture unavailable or disabled.
- Partial history: valid observations remain visible while skipped or conflicting archive data is called out.
- Responsive variants: 1440px desktop, 1024px tablet, 768px narrow tablet, and 420px mobile.
- Accessibility: status meaning uses text in addition to color; status is a heading, not a badge-only signal; focus and navigation remain unchanged; no content depends on hover.
- Motion: no new motion. Reduced-motion behavior remains equivalent.

## Visual direction

- Place one capture-health card before aggregate metrics so readers understand the evidence boundary before interpreting totals.
- Use restrained green for active capture, cyan for ready, amber for historical or intentionally disabled capture, and red only for an actual unavailable/failing path.
- Show three compact facts inside the card: last captured, completed-work coverage, and eligible live tasks.
- Use `1 of 81 completed Work Items`, not `1/81`, when explanatory clarity matters.
- Keep Token composition and observed drivers below the health and coverage context.
- Do not add decorative charts when there is only one observation.

## Implementation handoff

- Required design evidence: this brief and `required-state-coverage.md`.
- Mapping: `usage.source.capture_health` drives the state card; longitudinal coverage drives completed-work coverage; driver groups supply last-capture fallback only for compatibility.
- Known ambiguity: Provider readiness proves the local observer is available, not that the next notification will arrive or that every internal subagent is observable.
- Runtime visual-review method: installed Chrome through the repository Playwright browser gate plus explicit screenshots of real project data.
- Visual acceptance criteria: no horizontal overflow; no clipped status text; historical totals cannot be mistaken for current capture; private mode exposes no additional local authority; the one-observation dataset remains legible without empty chart chrome.

Code-first removes the requirement for a separate mockup; it does not remove runtime visual review or state coverage.
