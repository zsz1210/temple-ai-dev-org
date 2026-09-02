# WI-0091 Independent QA report

## Independence and candidate

- Candidate revision: `43444e1c8bdcd41e801b39a7a589e3f6909b0d39`
- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Environment: fresh detached Git worktree
- Node.js: `v24.20.0`
- Dependencies: `npm ci --ignore-scripts`; 8 packages audited, 0 vulnerabilities
- Browser: installed Google Chrome 152.0.7977.65

## Fresh verification

| Check | Result |
| --- | --- |
| Repository, documentation, and package boundary | Pass |
| Complete Node.js test suite | 270 passed, 0 failed in 54.4 s |
| Mobile 390x844 | Six primary views passed |
| Tablet 768x1024 | Six primary views passed |
| Desktop 1440x1000 | Six primary views passed |
| Ultrawide 3440x1440 | Six primary views passed |
| Reduced-motion behavior | Pass |
| Runtime schema | 112 documents against 28 schemas; valid |
| Doctor | 35 pass, one existing stale-plan warning, 0 fail |
| Exact-candidate worktree | Clean after verification |

## Adversarial findings

- An old observation with a disabled Provider remains `historical-only`, not `capturing`.
- A ready Provider without a live resumable task remains `ready-no-live-task`, not active capture.
- Missing observations remain unknown rather than zero.
- Account usage and repository activity cannot qualify or inflate project-attributed Tokens.
- The real proof retained its new observation after Provider shutdown without claiming continuous monitoring.
- Desktop, ultrawide, tablet, and mobile layouts preserve the capture-health hierarchy without overlap or horizontal overflow.

## Decision

`pass`

The candidate satisfies the bounded WI-0091 acceptance criteria and may advance to Release Gate review. This report does not authorize a push, publication, deployment, public release, cost claim, savings claim, or routing change.
