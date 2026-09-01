# WI-0088 Product Direction

## User problem

The Management Console is a human operational surface, but the existing automated suite mostly verifies generated HTML, data contracts, and server behavior. It has repeatedly stayed green while real screens showed collapsed spacing, narrow-sidebar distortion, clipped text, and overlapping content. A developer should not have to discover those failures by manually opening every viewport after every console change.

## Outcome

One repository command must open the real Console in Chrome, exercise every primary view, and fail on the layout and runtime regressions that mattered in prior reviews. The result must be understandable: name the viewport and view, explain the violated contract, and preserve a screenshot on failure.

## Required user-visible contracts

- Mobile navigation behaves as an overlay and does not permanently squeeze the content rail.
- Tablet, desktop, and ultrawide layouts use available width without document-level horizontal scrolling.
- Overview, Work, Team, Usage, System, and History render live repository data and remain reachable through named controls.
- High-level regions do not overlap; primary headings and navigation labels are not clipped.
- Team tabs remain keyboard-operable, and reduced-motion preference does not leave required state dependent on animation.
- Console and uncaught page errors fail the run.

## Proportionate test boundary

The browser gate is for full behavioral changes only and runs once on Node.js 24. Node.js 22 continues to prove the shared non-browser behavior and compatibility contract. This keeps the human-interface check blocking without creating a new job or duplicating it across both LTS lanes.

## Non-goals

- Pixel-perfect screenshot baselines.
- A Figma dependency or UI redesign.
- Browser downloads during normal installation or CI.
- Cross-browser claims beyond the installed Chrome gate.
- Remote mutation, deployment, publication, or repository-setting changes.
