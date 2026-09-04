# Alpha.30 exact-package qualification

## Result

The frozen Alpha.30 technical candidate passed exact-package qualification.

- Source revision: `a6849519c6067b2f73ca1a44d556faf7a5168b1d`
- Version: `0.1.0-alpha.30`
- Exact tarball: `zsz1210-temple-ai-dev-org-0.1.0-alpha.30.tgz`
- Tarball SHA-256: `8f93462cdea25068920279740450a72977f1a82b375fbf82bb26dac54aa36c95`
- npm SHA-1: `2a0e1f0bef2c6d1833e03405a589dfef2eec836f`
- Files: 380
- Packed size: 819,744 bytes
- Unpacked size: 3,254,381 bytes
- License: MIT
- npm publication state: private and unpublished

The complete npm file manifest and integrity string are retained in [`package-qualification-result.json`](../../.ai-org/artifacts/WI-0164/package-qualification-result.json). The generated tarball, installed dependencies, browser output, and disposable consumers were not committed.

## Candidate verification

At the exact source revision:

- repository, documentation-link, and package-boundary checks passed;
- all 443 Node tests passed with no failures or skips;
- all 188 cataloged JSON documents passed 36 Draft 2020-12 schemas;
- Doctor reported 36 pass, one generated-plan freshness warning, and zero failures;
- the installed-Chrome Management Console regression gate passed in 41.943 seconds;
- production and complete dependency audits reported zero known vulnerabilities; and
- the public repository-and-package audit reported zero blockers, 68 binary-review items, and one exact-provenance reviewed adapter fixture.

The parallel-plan warning is expected at this historical candidate revision because its Work Item activity made the generated plan stale. It does not permit dispatch; a current repository must rebuild the plan before parallel work.

## Clean Node.js 24 consumer

One disposable Node.js `v24.20.0` project installed the exact local tarball with install scripts disabled and no registry lookup. It then passed:

1. installed CLI version check;
2. first initialization from the complete five-Identity configuration;
3. identical re-initialization;
4. repository launcher version through the installed exact-version CLI override;
5. read-only status; and
6. Doctor with 36 pass, one generated-plan freshness warning, and zero failures.

The explicit launcher override is a private-candidate test path. The default public package-spec recovery cannot succeed until a package is actually published, and this result does not claim otherwise.

## Alpha.29 upgrade boundary

A separate local archive from Alpha.29 comparison revision `a3a28e7216652b04cfdc690e68bcb64b08fd5046` initialized a disposable project. The Alpha.30 dry-run and real upgrade showed:

- one lock update;
- no managed-file replacement;
- no project-data creation or migration;
- all 15 sampled project-owned file digests unchanged; and
- upgraded Doctor with 36 pass, one generated-plan freshness warning, and zero failures.

This is consistent with the candidate's source diff: Alpha.30 changes version identity, current tests, and release documentation, not the distributed managed overlay or project-data schema.

## Retained limits

- This is one exact local macOS/Node.js 24 qualification, not broad platform compatibility.
- Browser success is a regression gate, not a universal device, usability, or accessibility study.
- Package correctness does not establish universal Token, cost, latency, or productivity improvement.
- The result does not qualify automatic model execution, broad multi-machine work, regulated operation, or enterprise-wide use.
- Repository visibility, tag, GitHub Release, npm publication, deployment, and announcement remain separate Human decisions and were not performed.
