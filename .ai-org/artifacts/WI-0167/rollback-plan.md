# WI-0167 public Alpha rollback plan

If a critical defect or security issue is discovered in Alpha.30:

1. stop recommending the `@next` selector and record the exact affected version;
2. mark the GitHub prerelease with the retained issue and corrective path;
3. deprecate the npm version with a specific replacement message after separate npm write authorization and 2FA;
4. publish a corrected, higher prerelease version through a newly qualified Release; and
5. never attempt to reuse `@zsz1210/temple-ai-dev-org@0.1.0-alpha.30`.

Package withdrawal is destructive and is not authorized by this plan. It requires a separate owner decision and must preserve npm's non-reuse rule in the recovery record.
