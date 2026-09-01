# WI-0086 Technical Design

- Position: Tech Lead
- Agent Identity: Tidus (`agent-tidus`)
- Base revision: `d59ac2a9f0a56c41a7731fe8572c74be63a2e338`

## Candidate construction

1. Bump the package and lockfile to `0.1.0-alpha.29`.
2. Add a changelog entry covering the human-facing README, public-Alpha hardening, Node.js LTS contract, package allowlist, immutable Action references, and OSS health files.
3. Add one release-candidate validation record and index it without changing retained blocked validation results.
4. Reconcile release-readiness facts with hosted run `33517466651` and the final candidate run.
5. Run `npm run verify`, package dry-run inspection, production dependency audit, and tarball installation in disposable consumer directories under Node.js 22 and 24.
6. Commit the candidate, push it for hosted CI, and record the exact SHA. This does not create the release tag.

## External settings plan

The final public step must separately configure or verify main-branch protection, required Node.js 22 and 24 checks, force-push and deletion protection, private vulnerability reporting, secret scanning, push protection, and the chosen private moderation route. Settings must be inspected before mutation and verified afterward.

## Ownership boundaries

- `SECURITY.md` changes are limited to release-facing supported-version and reporting-route truth; WI-0033 retains provider-trust design.
- `docs/validation/README.md` receives only the WI-0086 record; WI-0067 remains blocked and unchanged.
- Local Playwright outputs and other user-owned untracked files are excluded from the candidate and must not be deleted or committed.
