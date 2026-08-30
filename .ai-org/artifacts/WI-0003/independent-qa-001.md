# WI-0003 Independent QA report

- Work item ID: `WI-0003`
- Tested revision: `f77b44e5d13048a39d4c68901f20938a2ebad26b`
- QA Agent ID: `agent-lulu`
- Developer Agent ID: `agent-rikku`
- Environment: clean detached Git worktree with lockfile-strict dependencies
- Result: pass

## Reproduction

1. Created a detached worktree at the exact candidate revision.
2. Ran `npm ci`; six packages were installed, the audit reported zero vulnerabilities, and the command exited successfully.
3. Ran `npm run check`; repository policy and every local Markdown link passed.
4. Submitted each README source independently to GitHub's GFM renderer.
5. Compared the resulting structural signals across all three languages.

## Acceptance criteria checked

- Each README renders one centered `h1`, a CI badge with alt text, and compact status metadata.
- Each README contains ten second-level sections, three Quick-start substeps, five section dividers, and three collapsible scenarios.
- No fixed-width container, custom CSS, generated logo, or decorative image was introduced.
- Links and capability claims remain unchanged except for the new CI workflow link and layout metadata.

## Counterexamples attempted

- Checked whether Markdown inside the centered HTML hero was swallowed by an HTML block; the hero uses explicit HTML elements and rendered correctly.
- Checked for structural drift among English, Japanese, and Traditional Chinese.
- Checked for a missing local license or language link.
- Checked for an unsupported production or benchmark claim introduced by the layout pass.

## Residual risk

Actual GitHub page spacing and badge loading should be observed after push. That post-push visual check is presentation evidence, not a reason to expand the accepted scope.
