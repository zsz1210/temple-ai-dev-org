# UI Design Brief — WI-0092

- Work item: `WI-0092`
- UI Designer Position owner: UI Designer
- Agent Identity: Yuna (`agent-yuna`)
- Delivery mode: `code-first`
- Surface: Temple Management Console `Usage`
- Medium: executable HTML/CSS/JavaScript rendered by `src/control-plane-dashboard.mjs`

## Why code-first

The dark responsive Console, Usage hierarchy, and capture-health card are approved and already executable. This slice adds one operational mode and one evidence-gap state within that established system. Runtime content wrapping, private-viewer safety, and narrow-screen density matter more than a disconnected mockup.

## Human hierarchy

1. **Token observation** — current mode and ability to collect now.
2. **Coverage since observation started** — whether accepted post-start work is represented.
3. **Retained totals** — historical evidence and all-time coverage.
4. **Composition and drivers** — analysis only after the evidence boundary is understood.

Use `Off`, `On demand`, and `Managed local` as labels. Do not expose `launchd`, plist paths, PIDs, App Server protocol names, or internal reason codes in the primary card.

## Required states

- Off with no history.
- Off with retained history.
- On demand and ready with no live task.
- On demand with a live eligible task.
- Managed local running and no post-start gap.
- Managed local running with unobserved completed work.
- Managed local installed but unavailable/degraded.
- Partial telemetry archive.

## Visual behavior

- Add Mode as a compact fact next to Last captured, Completed work, and Eligible live tasks.
- Use an amber inline notice for unobserved completed work; red remains reserved for a genuinely unavailable Provider path.
- The notice explains that the gap may be task-registration or Provider coverage, not necessarily daemon failure.
- Keep service actions out of the private read-only page. Provide commands in documentation, not LAN buttons.
- At 420px the fact grid stacks without clipped labels or horizontal overflow.
- Add no new animation; reduced-motion behavior is unchanged.

## Acceptance evidence

- Browser screenshots with real retained Temple data at desktop, tablet, and mobile widths.
- A fixture with managed-local plus one post-start unobserved Work Item.
- Private snapshot inspection proving paths, executable names, and local service controls are absent.

