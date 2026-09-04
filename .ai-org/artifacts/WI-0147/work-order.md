# WI-0147 Work Order

## Problem

Pull request #27 completed every declared verification step successfully, but GitHub cancelled the job during post-job cleanup because the total runtime exceeded the workflow's five-minute hard limit. Both observed attempts spent approximately five minutes installing the same lockfile-pinned dependencies on a fresh runner.

## Approved scope

- Change `.github/workflows/ci.yml`, its bounded contract in `test/ci-scope.test.mjs`, and WI-0147 lifecycle evidence.
- Keep one bounded Node.js 24 verification job.
- Enable the `setup-node` npm cache, keyed through `package-lock.json`.
- Raise the whole-job timeout from five to eight minutes so a cold-cache run can finish checks and cleanup.
- Do not add test suites, publish artifacts, create a release, or change repository visibility.

## Acceptance criteria

1. Dependencies remain installed with `npm ci --ignore-scripts` from the pinned lockfile.
2. The built-in npm cache is enabled without caching `node_modules`.
3. The workflow retains a finite timeout and the existing single required check.
4. A pull-request run completes successfully.

## Technical design and risk review

`actions/setup-node` will use `cache: npm` and `cache-dependency-path: package-lock.json`. This caches npm's download cache, not installed dependency directories. Eight minutes is a bounded ceiling chosen from two observed runs that reached about five and a half minutes only because the five-minute limit interrupted cleanup. The change is reversible and does not weaken any verification step.

Risk is low. A stale or empty cache still falls back to the pinned `npm ci` installation, while cache-key invalidation follows lockfile changes.
