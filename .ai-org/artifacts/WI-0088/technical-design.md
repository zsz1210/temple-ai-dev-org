# WI-0088 Technical Design

## Dependency boundary

- Add `playwright-core` `1.62.1` as an exact `devDependency`.
- Record its Apache-2.0 license and Microsoft Playwright repository in `THIRD_PARTY_NOTICES.md`.
- Launch the branded `chrome` channel. Do not run `playwright install`, vendor a browser, or add browser files to the npm package.
- Local execution therefore requires an installed Google Chrome. GitHub's Ubuntu runner image installs Google Chrome and exposes it as `/usr/bin/google-chrome`.

## Browser harness

`scripts/verify-console-browser.mjs` will:

1. create a temporary runtime-state directory;
2. start the real repository Control Plane on `127.0.0.1` and an ephemeral port without enabling Codex or external providers;
3. launch headless Chrome through Playwright Core;
4. inspect `390 × 844`, `768 × 1024`, `1440 × 1000`, and `3440 × 1440` contexts;
5. wait for live snapshot rendering, then navigate Overview, Work, Team, Usage, System, and History;
6. check document overflow, high-level region intersections, primary text clipping, visible headings, navigation state, mobile sidebar behavior, organization-tab keyboard behavior, reduced-motion CSS, console errors, and uncaught page errors;
7. write a viewport/view-specific failure screenshot below `output/playwright/`, report every violation, and return nonzero;
8. close browser, HTTP server, journal/provider loops, and temporary state in `finally`.

The gate is contract-based, not pixel-perfect. It detects the classes of failure previously observed by the user while avoiding unstable image baselines.

## CI integration

- Add `npm run test:browser`.
- In the existing matrix job, run it only when scope is `full` and `matrix.node-version == 24`.
- Add the result to the job summary and require success in the final aggregation only for that lane.
- Do not create an extra job. Node.js 22 continues the full non-browser compatibility suite.
- Documentation-only and evidence/state-only scopes do not install or launch a browser beyond their existing normal dependency installation.

## Contract tests

`test/console-browser-contract.test.mjs` will verify viewport definitions, failure-artifact containment, overlap math, Chrome-channel use, temporary loopback server cleanup, and the CI condition/aggregation contract. Existing CI-scope tests will be updated for the browser step while preserving fail-closed selection.

## References inspected

- Playwright BrowserType launch and branded channel API: <https://playwright.dev/docs/api/class-browsertype>
- Playwright browser guidance: <https://playwright.dev/docs/browsers>
- GitHub runner images and installed software: <https://github.com/actions/runner-images>
- GitHub runner Google Chrome installer: <https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/install-google-chrome.sh>
