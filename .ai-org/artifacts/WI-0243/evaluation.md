# Alpha.33 candidate evaluation

**PASS for bounded release preparation.** Quality Evaluator: `agent-lulu`, assigned
separately from Developer `agent-rikku` in project assignments. Exact tested
candidate: `b2edfe22678beaa904eaec27b4d01330707623c6`, Node.js v24.20.0 on macOS.
Active verification claim: `claim-20260916065706-3f93383a`.

## Evidence and provenance

- Independently archived the exact corrected Git revision and repacked it. The
  archive is 997361 bytes, 444 files, SHA-256
  `03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2`.
  No packaged path changed from `02103e99d45adbf1f3bcc3abbc1325658aee11d3`.
- Reused the preceding independent worker's seven package qualification groups
  only on that byte-equality basis. The replay includes fresh/repeated init,
  pinned launcher, Doctor/Status, and preservation of all 31 existing
  project-owned files and actor policy. Its source revision and measurements
  remain explicit in `qa-observations.json`; these are not represented as new runs.
- Added a true Alpha.32 pre-upgrade managed `TEMPLE.md` conflict: Alpha.33 upgrade
  exits 1 and all 129 fixture files retain their bytes, including the old lock.
  This closes the earlier harness's post-upgrade-only conflict coverage gap.
- Added the wrong-version launcher control: the old launcher rejects explicit
  Alpha.33 `TEMPLE_CLI_PATH`, exits 1, and all 128 files remain unchanged.
- Added a custom project-owned file inside `.ai-org/core/`: it survives a successful
  upgrade byte-for-byte and remains absent from exact `lock.managed_files` entries.
- Independently reviewed the cleanup test correction. It moves the fake provider's
  acknowledgment after owned PID disappearance; it retains immediate post-executor
  ESRCH checks, owned-ID matching and failure classification. Two added 120 ms
  delayed termination controls prove the executor awaits acknowledgment before
  settling/closing and preserves scratch plus the original error on failed cleanup.
- Inspected the parent's final full-verification evidence: `npm run verify`, exit 0,
  1248/1248 passed, zero failed/cancelled/skipped/todo, 273728.85175 ms. The exact
  retained log digest is recorded in `qa-observations.json`. This worker did not
  duplicate the complete suite. The initial rejected run remains 1247/1248.
- Retained package audit reports allowed: 444 files, zero findings. Retained dated
  dependency audit reports zero vulnerabilities. Neither is a security certification.

## Limits and next responsibility

The supplemental harness needed two instrumentation corrections to read
`temple.lock.template.version`; its final complete run passed. No implementation
repair was made by QA. These are disposable synthetic checks, not real downstream,
multi-machine or live-provider qualification. Successful real-provider termination
acknowledgments are trusted by the protocol; dishonest acknowledgments were not
qualified here. No model calls, publication, tags, deployment or downstream changes
occurred.

Actual observations are in `qa-observations.json`; full-suite details are in
`full-verification.md` and `full-verification-final.log`. Formal Independent QA
judgment follows the distinct lifecycle stage. This evaluation grants no publication
or downstream-upgrade authority.
