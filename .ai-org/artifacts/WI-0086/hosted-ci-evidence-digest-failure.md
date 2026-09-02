# WI-0086 Hosted CI Evidence-Digest Failure

- Run: [GitHub Actions 33576741884](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33576741884)
- Head revision: `78097b0aa3e930912b8f104a57cd1d1437827a61`
- Node.js 22 job: `100082260710`
- Node.js 24 job: `100082260848`
- Result: failed; not waived

## Observed result

Both Node.js lanes passed the complete 270-test suite. The Node.js 24 lane also passed the installed-Chrome Management Console gate. Schema validation and repository checks passed. Both jobs failed the separate Doctor gate with:

`EVID-20260902T004526Z-57715AA3:.ai-org/artifacts/WI-0086/public-release-blockers.md digest mismatch at recorded revision dba1866ae0ebbcf7ada1474be38016970355b040`

## Cause

The test evidence was scoped to exact candidate `dba1866`. Its artifact list incorrectly included `public-release-blockers.md`, a file that already existed at that revision and was intentionally updated in the later repository-only evidence commit. Doctor therefore read the historical candidate blob and correctly rejected the later digest. The local full test command did not replace the explicit Doctor gate, so the hosted failure exposed the mismatch as designed.

## Correction

- Removed the post-candidate mutable blocker file from the exact-candidate observation's artifact list.
- Recomputed the observation-file digest in the canonical evidence registry.
- Retained the exact-candidate documentation files and newly created repository-only evidence artifacts.
- Re-ran schema validation and Doctor locally; schema remained valid and Doctor returned 35 pass, one known stale-plan warning, and zero failures.

The failed run remains release evidence. A fresh hosted run must pass before WI-0086 can advance. No repository visibility, GitHub setting, tag, GitHub Release, announcement, or npm publication action was performed.
