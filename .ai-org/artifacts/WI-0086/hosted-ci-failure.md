# WI-0086 Hosted CI Failure

- Candidate revision: `fe9f7d9846bf0741cb2bc34443c0db34ade7c5d7`
- GitHub Actions run: `33520595751`
- Node.js 22 result: pass
- Node.js 24 result: fail
- Failed job: `99898555681`

## Failure

The full Node.js 24 test job completed 260 of 262 tests successfully. Two otherwise successful control-plane inbox tests failed during their shared fixture cleanup because recursive removal raced with temporary Git metadata on the Linux runner:

- `ENOTEMPTY .../.git/info`
- `ENOTEMPTY .../.git`

This is a release-candidate failure even though the behavioral assertions passed. The candidate must not advance while either supported Node.js lane is red.

## Required correction

Use bounded retry behavior for the temporary-tree cleanup without weakening any behavioral assertion. Bind all replacement evidence to a new exact candidate revision and rerun both hosted Node.js lanes.
