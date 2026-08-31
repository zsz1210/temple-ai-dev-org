# Product specification — WI-0044

## Product outcome

An operator opening the Dashboard can answer three questions within the first screen:

1. Is the AI development organization healthy?
2. What requires human attention now?
3. Which Agent is responsible for the work currently moving?

The operator must not need to understand Temple's storage schemas or scan a long page to find the answer.

## Navigation model

The product has five primary views over one live snapshot:

| View | Question answered | Primary content |
| --- | --- | --- |
| Now | What needs me now? | health, highest-priority attention, current work, decisions |
| Execution | Who is doing what? | Agent → Position → Work Item → Codex task → observed model |
| Usage | Where are model resources going? | qualification, Token composition, drivers, routing evidence |
| System | Can I trust the observation path? | provider health, conditions, connection, viewer transport |
| History | What happened before? | terminal Work Items, canonical and observed timeline |

The loopback viewer also exposes two clearly labeled local tools: Human Inbox and Agent Commands. Private LAN and Tailscale viewers omit those destinations and remain read-only.

## Functional requirements

- Desktop and landscape tablet use a persistent left sidebar. Narrow screens use a compact sticky navigation row without creating a second hidden information hierarchy.
- Navigation changes the visible view without a page load, preserves a meaningful URL fragment, supports keyboard focus, and never blocks live snapshot refresh.
- `Now` prioritizes blocked work, live runtime questions, and firing recovery conditions over release bookkeeping and historical evidence.
- `Execution` shows the responsibility chain even when runtime evidence is absent. Missing Agent, task, model, usage, or revision values remain explicitly `unknown` or `not observed`.
- Work Item details remain available, but terminal items move to `History`.
- Insufficient Usage evidence renders one concise state and qualification requirement. Detailed composition and drivers appear only when observations exist.
- Connection state, snapshot freshness, and private transport remain visible from every view.
- Current redaction, replay coalescing, stale-snapshot mutation lock, and local-only command confirmation remain unchanged.

## Responsive and accessibility requirements

- No horizontal page overflow at 1440×1000, 1024×1366, 768×1024, or 420×900.
- Every destination is reachable by keyboard and exposes `aria-current` for the active view.
- Focus is visibly rendered; text and status do not depend on color alone.
- Reduced-motion users receive no spatial view transition.
- Frequent navigation is immediate; only short opacity/color transitions may soften state changes.

## Acceptance measures

- The first viewport contains project health, a plain-language action summary, and active-work ownership.
- `Execution` is reachable in one interaction and displays Agent, Position, Work Item, task, and model labels in one coherent component.
- Human Inbox and Agent Commands are reachable in one interaction on loopback and are absent from private viewers.
- Browser evaluation finds no console error, broken anchor, inaccessible navigation state, or horizontal overflow across required viewports.
- Existing private-viewer and control-plane regression tests remain green.

## Non-goals

This slice does not add time-series storage, pricing, automatic model selection, a portfolio backend, Jira synchronization, SRE/Security telemetry, login-time service startup, or remote Agent Commands.
