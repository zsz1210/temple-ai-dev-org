# Developer evidence — WI-0024

- Developer revision: `d3e28fd4587e3194ae689c5e46de24ad889c3810`
- Integrated candidate: `2bf07c0dcc94769b6c964c2a935b1d74bb3b5734`
- Focused recovery tests: 16/16 passed
- Launcher/bootstrap tests: 36/36 passed
- Integrated full verification: 186/186 passed
- Doctor: 35 pass, 1 stale-plan warning, 0 fail

Bootstrap metadata validation is now total and fail closed for absent, null, array, primitive, and malformed values. The real older-lock shape restores with `upgrade_required`, Doctor reports `cli_bootstrap` failure without throwing, and an ordinary upgrade recreates valid pinned metadata and returns Doctor to healthy. The primary AiPet checkout was not modified.
