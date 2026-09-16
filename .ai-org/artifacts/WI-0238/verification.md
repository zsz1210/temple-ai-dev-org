# Test setup performance Developer evidence

Developer: agent-rikku, Principal human. Exact candidate: `472c167396c676c7feb0695729f03707be581854`. Baseline: `e4ea52ace541df2bf44602ad2135e5d3850763f1`. Production, scripts, fixtures, policy, package, timeouts and discovery are unchanged; only `test/delivery-control-pair.test.mjs` changes. All 35 original focused results remain, with one added isolation regression. No skip is added.

## Measurement

The temporary profiler wraps async execFile and filesystem calls, retaining real callbacks and custom promisification. It does not instrument descendant processes or synchronous spawnSync. Filesystem elapsed sums overlap; they are not wall time. The first exploratory before/after used random orders, so actor counts differed and their timing is not an isolated effect estimate. Both observations remain in `profile-observations.json` and `focused-profiling.tar.gz`.

The corrected pair forced the same initial Temple-first order only in the temporary profiler. Both ordered fault cases still ran. The baseline executed the original test body in a temporary `test/.profile-baseline.mjs`, differing only by one harmless trailing newline, with the same current unchanged production modules and source root. That temporary file was deleted before commitment and full verification. Test source remains randomly ordered normally.

| Observed metric | Controlled baseline | Controlled candidate |
| --- | ---: | ---: |
| Focused runner ms | 62638.900625 | 57841.213125 |
| Test results / pass | 35 / 35 | 36 / 36 |
| Failure / skip | 0 / 0 | 0 / 0 |
| Pair preparations | 5 | 2 |
| Preparation Temple CLI calls | 25 | 10 |
| Preparation Temple CLI elapsed ms | 9868.901753 | 4059.849498 |
| Actual actor shell operations | 481 | 481 |
| All measured async execFile calls | 1027 | 955 |
| Filesystem copy calls | 31 | 39 |

The controlled sample improved by 4797.6875 ms (about 7.66 percent), including the extra isolation case. The structural result is 60 percent fewer preparation CLI calls and 72 fewer measured async process calls with every actor command retained. Extra copies are intentional independent state. This is one ordered pair, not a statistical speed guarantee or billing/model benchmark. No account checks or paid calls.

The copied initial product, canonical Work Item and Git configuration remain independent in both orders: changing one clone cannot change its pristine template or a later clone. Existing public-file protection, fresh verifier, source/fixture drift, invalid approvals, no-turn guards, usage and interruption scenarios remain unchanged. The final deliberate template-drift negative occurs after all clone consumers.

## Final verification boundary

`npm run verify` ran once against committed candidate `472c167396c676c7feb0695729f03707be581854`, without the profiler or forced ordering. Exit 0: repository checks, documentation links and the 443-file package boundary passed; full results are 1238 tests, 1238 pass, zero fail/cancelled/skipped/todo, duration 342562.26925 ms. All 117 test files remain. No source changes followed the tested candidate.

Raw log SHA-256: `40d881b0ee719a15aca1961fe4594be25bb4d7e125beca1210fd34e15bd19d5e`. Preserved `verification-472c1673.log.gz` SHA-256: `c03521ad1514e6e1c3bd0161f5de52cdc03b66c5af6c161cb4b6becc09d4d98a`.

The prior full sample was 288684.186083 ms; this sample is approximately 18.66 percent longer. These full runs are uncontrolled machine-wide observations and do not establish a full-suite speed improvement or isolate its cause. The bounded success is fewer repeated preparations and a faster focused controlled sample; no aggregate speed claim is accepted. Further profiling of the shared fixture on the full suite's critical path would be a separate scope, rather than more unplanned full reruns here.

Distinct review is recorded in `independent-review.md` after inspection of the completed log. Its actual helper controls are retained in `independent-controls.tar.gz`, SHA-256 `5d4922303fa254e94f6c2294b627d4b5a39a423d566470db2f11da811f54d058`. No merge or publication is included.

## Closeout

The actual distinct reviewer accepted Test, Evaluation and Independent QA for the exact candidate. WI-0238 is `done` with a bounded local `go` record, no active claim or worker and zero unresolved items. The refreshed all-active plan has zero items or conflicts. Doctor returned 37 pass, one pre-existing absent actor-policy warning, zero failures. Post-candidate changes are evidence and canonical administration only; test/source/script/package inputs remain identical. Final `npm run verify:fast` output is retained as `closeout-verify-fast.log.gz` after execution.
