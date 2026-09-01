# WI-0087 Work Order

## Objective

Replace the failed Alpha.29 candidate with one whose temporary Git fixture cleanup is stable on Linux under Node.js 22 and 24.

## Constraints

- Change only the cleanup behavior of temporary test trees.
- Keep every behavioral assertion and security boundary unchanged.
- Use bounded retries; do not hide persistent cleanup failures.
- Bind the parent release candidate to a new exact revision and rerun hosted CI.

## Source evidence

- Parent blocker: `.ai-org/artifacts/WI-0086/hosted-ci-failure.md`
- GitHub Actions run: `33520595751`
- Failed Node.js 24 job: `99898555681`
