# WI-0005 Independent QA Report

- Work Item ID: `WI-0005`
- Tested revision: `891e3ab618bbbdaaac821aef4d472250a566a447`
- QA Agent ID: `agent-lulu`
- Developer Agent ID: `agent-rikku`
- Environment: clean standalone local clone with lockfile-strict dependencies
- Result: pass

## Reproduction

1. Created a standalone clone and checked out the exact candidate revision in detached mode.
2. Ran `npm ci --ignore-scripts`; six packages were installed and the audit reported zero vulnerabilities.
3. Ran `npm run verify`; repository checks, documentation links, and all 137 tests passed.
4. Ran Doctor through the candidate CLI with `TEMPLE_CLI_PATH=./bin/temple.mjs node ./templew.mjs doctor .`; the result was 35 pass, one stale-plan warning, and zero failures.
5. Moved the temporary clone to Trash after verification.

## Acceptance criteria checked

- Historical tracked content remains verifiable after a later commit changes the same path.
- A forged historical digest still fails with a recorded-revision diagnostic.
- A syntactically valid but unavailable commit fails explicitly.
- Artifacts absent from the candidate revision retain current-file drift detection.
- The real WI-0003 and WI-0004 evidence records validate without rewriting their digests.

## Counterexamples attempted

- Changed a tracked artifact after evidence capture and confirmed historical evidence remained valid.
- Replaced the historical digest and confirmed Doctor rejected it.
- Replaced `scope_revision` with an unavailable SHA and confirmed Doctor rejected it.
- Mutated a post-revision runtime artifact and confirmed the existing drift test still rejected it.

## Self-host launcher note

The default repository launcher intentionally resolves the published pinned package. In a standalone development clone that package treats the clone as a misplaced self-host target. Independent QA therefore selected the candidate CLI explicitly through the launcher's supported `TEMPLE_CLI_PATH` boundary before evaluating Doctor. This exercised the candidate implementation and produced a clean Doctor result.

## Residual risk

Revision-bound verification requires the recorded Git commit to remain available locally. Doctor reports that condition as a failure rather than silently trusting current files.
