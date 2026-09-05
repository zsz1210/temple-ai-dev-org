# WI-0174 — Corrected candidate verification

- Candidate: `3cd0e55489be856854105497182d5d7514d3dd06`
- Developer: Rikku (`agent-rikku`)
- Local evaluation responsibility: Lulu (`agent-lulu`)
- Supersedes gate use of the first Developer report; that report and the first QA failure remain historical.

## Correction and evaluation

Caught audit-write failures now restore the exact original Work Item bytes under the mutation lock. The regression reproduces Independent QA's directory-target failure, checks byte-for-byte restoration, restores the event destination, then confirms a single successful rework and audit event on a subsequent invocation. Rework findings and prior handoffs are also retired as gate references. A historical Developer author must be recorded rather than guessed from current assignments.

`node --test test/work-item-rework.test.mjs` passed **15/15**, zero failures or skips, **26,211.094 ms**. These checks cover every supported review stage, repair/closeout, repeated attempts, invalid requests, audit rollback, High-Assurance, Collaborative identity, runtime reservations, stale evidence, current pointer clearing, scope drift and custom prebuild classification.

The selected scope remains unchanged. Final `npm run verify` on this exact candidate passed **481/481**, zero failures or skips, **79,979.148 ms**. Repository checks, documentation links and package boundaries passed (390 package files; 846,112 packed bytes; 3,335,179 unpacked bytes). No implementation, test, distribution or documentation bytes changed during the run. The preceding `e8d364e` candidate's 481/481 run is historical, not substituted for this final run. Independent QA is recorded separately.

## Dogfood record

WI-0174 itself used `work-item rework` after the independent audit failure: the same ID returned from Independent QA to Build, the failed runtime ended explicitly, the review claim was released, the old candidate/gates were archived, and Rikku claimed the correction. The new handoff uses a fresh evidence path. No new implementation Work Item was needed.

## Limits

In-process rollback does not establish crash-atomic persistence or recovery after a second I/O failure. Legacy handoffs lacking a trustworthy author are refused. No claimed Token savings, real multi-machine qualification, publication or remote integration follows from these local checks.
