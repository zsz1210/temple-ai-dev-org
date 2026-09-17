# Developer verification

Exact behavioral candidate: `41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261`.
Developer: `agent-rikku`. Runtime: Node.js v24.20.0 on macOS arm64.

- Nine new focused tests passed, covering report generation, no rerun, unknown
  billing, failed/latest attempts, physical candidate drift hidden by Git flags,
  missing directory entries, mode changes, artifact tampering, unsafe paths,
  CLI failure status, task assignment/claim/Position/terminal distinctions and
  route validation without writes.
- Existing field actor and verification regressions: 31 passed.
- `npm run verify`: exit 0, 1,288 tests passed; zero failed, cancelled, skipped
  or todo. Node test duration 265,092.194625 ms; wall time 266.75 seconds.
- Repository and documentation checks passed. Exact package manifest: 448 files,
  1,010,357 packed bytes and 3,923,843 unpacked bytes. No new allowed package roots.
- `git diff --check` passed. No Management Console/UI change; browser gate does
  not apply to these CLI/record changes.
- Two-host three-case fixture measurements and raw TAP are in `measurements.md`.
  Each host retained one attempt after a reuse lookup and three report exports.

Full raw local log: `/tmp/temple-wi0250-full.log` (a retained local observation,
not a portable evidence artifact). An initial focused fixture omitted temple.lock;
correcting that fixture yielded 9/9. The first package check correctly rejected the
two added public files until the reviewed ceiling adjustment in child WI-0251.

Doctor initially reported 36 pass/1 stale parallel-plan warning/0 fail. A later
check found the parent and mechanical child temporarily sharing an active claim
branch; sequential closeout must release the child before final organization
qualification. Do not treat this as a product-test failure or erase its history.

Limits: report applicability covers declared inputs only, not independently
complete test coverage. Reports never accept a candidate. Unknown tokens/cost are
null. No real-user multi-person generalization, main merge, release, publication,
full cache-performance baseline or cross-branch integration is claimed.
