# Corrected candidate Developer evidence

Developer agent-rikku; exact candidate `b2edfe22678beaa904eaec27b4d01330707623c6`.
Supersedes the rejected candidate `02103e99d45adbf1f3bcc3abbc1325658aee11d3`.

The first full run completed: 1248 tests, 1247 pass, one failure, zero skipped,
cancelled or todo; 276242.684833 ms. The single failure is the reproduced owned
descendant cleanup assertion documented in rejected-candidate.md. Eight bounded
reproductions produced one failure; a lone earlier focused pass was not accepted.

Only test/continuity-live-runner.test.mjs changed behavior in this correction: the
fake provider waits at most two seconds for each owned PID to disappear before
acknowledging termination. The post-executor immediate ESRCH assertions, original
injected transport failure, process ID ownership, cleanup confirmation and scratch
policy remain enforced. Corrected focused repetitions: 30/30 pass. Runtime product
files and package contents are identical to the first frozen package.

The final full run is in progress on this exact candidate; its result remains
required before acceptance. Reuse the seven package checks, archive manifest and
audits only after confirming exact archive equality. Independent QA also plans a
true pre-upgrade managed-file conflict and old/new launcher mismatch control.

No publication, downstream migration or paid model test is authorized by this record.
