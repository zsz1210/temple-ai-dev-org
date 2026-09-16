# Same-scope rejection: 02103e99d45adbf1f3bcc3abbc1325658aee11d3

The running full verification reports a failure in
`oracle RPC failure cleans an owned hanging command and child before returning`.
A separate bounded repetition reproduced it on run 8: the final assertion at
test/continuity-live-runner.test.mjs:318 expected process.kill(pid, 0) to throw
ESRCH immediately after the direct child's exit, but the descendant PID still
existed. The process-group termination mock acknowledges after the direct child's
exit, without waiting for the OS to reap its descendant. A single focused pass
does not override this failure. Full output will be retained when the run finishes.

Independent QA has reproduced identical archive bytes and seven package/upgrade
groups, but has not accepted the candidate. Complete its prepared worker before
same-scope rework. Additional affected path: test/continuity-live-runner.test.mjs.
No other active Work Item overlaps it; record here because configure has no
supported affected-path update and canonical JSON must not be manually rewritten.

Correct the fake provider's termination acknowledgement to wait, with a bounded
deadline, for every owned PID to disappear. Keep the final immediate ESRCH assertions
after the executor returns, the original transport failure, owner process ID check,
instrumentFailure and no-retained-scratch expectations. Do not hide a surviving
process by waiting only after the executor returns or by weakening the assertions.
Runtime product code and archive contents need no change for this fixture defect.
