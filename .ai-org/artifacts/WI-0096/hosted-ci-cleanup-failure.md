# Hosted CI Cleanup Failure — WI-0096

- Run: [GitHub Actions 33582511826](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33582511826)
- Head revision: `439aa3e5896be3ac59fd5627c4a5452b50240c08`
- Node.js 22 job: `100099586053` — pass, 276/276
- Node.js 24 job: `100099586280` — fail, 275/276
- Node.js 24 browser gate: pass
- Result: failed; not waived

## Failure

The single Node.js 24 failure occurred after the named Phase 4B scenario assertions, during recursive fixture cleanup:

`ENOTEMPTY: directory not empty, rmdir '/tmp/.../policy-product/.git/objects'`

Repository checks, schema validation, and Doctor passed in both lanes. The original managed Observer platform-contract test passed on Linux; this run therefore verifies the WI-0095 correction while exposing a separate cleanup race.

## Required correction

Use bounded retry behavior for every recursive Phase 4B temporary-tree cleanup without changing behavioral assertions. Bind replacement evidence to a new exact revision and require another hosted run.
