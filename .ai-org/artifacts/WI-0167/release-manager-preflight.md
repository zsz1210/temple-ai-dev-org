# WI-0167 Release Manager Preflight

- Owner approval: [owner-approval.md](owner-approval.md)
- Qualified package source: `6a8760f9669c58085b069e91776b89d0a857fc83`
- Exact package SHA-256: `6b4ab4f1a0bbbe3d8eae532dcec8a04c92797f4254fc992b2c5b9f8d91efda88`
- Independent QA: [independent-qa-report.md](independent-qa-report.md)
- Result: **Ready for protected-main integration**

## Required sequence

1. Push this branch, open a pull request, and require the protected Node.js 24 check to pass.
2. Merge to `main`, then verify the exact main revision, required check, adapter status, and Dependabot alert closure.
3. Confirm `npm pack` at the final release revision produces the already qualified archive identity. Only `.ai-org/` evidence may differ from the qualified source commit; npm excludes that boundary.
4. Create signed-by-service Git tag `v0.1.0-alpha.30` at that exact main revision and a GitHub prerelease whose notes retain the Alpha limits.
5. Publish the prebuilt exact `.tgz` to npm with public access and dist-tag `next`. Do not rebuild or assign `latest`.
6. Verify registry name, version, integrity, dist-tags, repository metadata, and a clean registry install.
7. Record the external observations and close WI-0167 only after both public prerelease surfaces are verified.

## Stop conditions

Stop before the next public action on a failed required check, non-identical archive, remaining dependency alert from the removed adapter, unexpected npm version or dist-tag, registry authentication failure, second-factor requirement, or any source change outside the already qualified npm exclusion boundary.
