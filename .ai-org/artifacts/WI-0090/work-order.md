# Work Order — WI-0090

## Outcome

Requalify Alpha.29 from the completed WI-0088 and WI-0089 history, push one exact private candidate, and leave every Human or public-release gate explicit.

## Included work

- Reconcile the Alpha.29 changelog, readiness report, and candidate validation record with the real-browser Management Console gate and outcome-first Codex task titles.
- Verify the exact candidate locally with the supported Node.js majors, a real installed Chrome browser, the package allowlist, dependency review, and clean consumer installs.
- Push `main`, require the hosted Node.js 22 and 24 matrix plus the Node.js 24 browser gate to pass, and record the exact results.

## Boundaries

- Preserve `.playwright-cli/` and `output/playwright/**` as user-owned untracked output; do not stage, delete, or package it.
- Do not change repository visibility or GitHub settings.
- Do not create a tag, GitHub Release, announcement, or npm publication.
- Keep the parent WI-0086 blocked until its named Human and public-action gates are independently satisfied.

## Evidence required

- Exact Git revision and package manifest.
- Complete local verification under Node.js 22 and 24.
- Installed-Chrome browser regression result.
- Exact-tarball consumer smoke under Node.js 22 and 24.
- Hosted GitHub Actions result at the pushed candidate.
- Distinct Independent QA and a rollback procedure for the private candidate.
