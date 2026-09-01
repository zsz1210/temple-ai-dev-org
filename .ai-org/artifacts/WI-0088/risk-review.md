# WI-0088 Risk Review

| Risk | Control |
| --- | --- |
| Browser download increases CI time, storage, or supply-chain surface | Use pinned `playwright-core` and the runner's installed Google Chrome; never run a browser installer. |
| Browser test doubles hosted jobs or both LTS lanes | Keep one existing matrix job and run the browser step only in the Node.js 24 full lane. |
| Chrome version drift creates false pixel failures | Assert semantic layout and runtime contracts; do not use pixel baselines. Record the actual browser version in output. |
| Missing Chrome silently skips safety coverage | Fail with a direct installation/environment message; no skip in a full CI lane. |
| Generic overlap detection flags intentional overlays | Check only named high-level sibling regions while the mobile sidebar is closed; do not scan every DOM node. |
| Hidden or truncated technical text creates noise | Limit clipping checks to primary headings, navigation, tabs, and metric labels; intentionally ellipsized data rows are excluded. |
| The harness leaves a server, browser, or temporary state behind | Close all resources in `finally`; contract-test output containment and cleanup code. |
| Test infrastructure accidentally enters the public package | Keep the harness in `scripts/`, the contract in `test/`, and retain the existing package allowlist gate. |
| WI-0086's earlier Alpha candidate appears current after lockfile change | Record the overlap explicitly; future publication must create a new exact candidate after WI-0088. |
| Local Chrome automation touches the user's profile | Launch an ephemeral Playwright context, never a persistent/default Chrome profile. |
