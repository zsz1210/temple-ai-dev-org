# Native continuity runner repair

Candidate: `87466e5d298efee0479e0499fddba8ce7aecaef8`.

The [renewed approval](repair-approval.md) authorizes a new v2 comparison, not reuse
of the [invalid v1 run](report.md). The old report remains historical evidence.

## Changes

- Explicitly enable the native code-mode host, shell tool and unified execution;
  verify their effective values while retaining external-tool and sandbox limits.
- Permit null candidate/test fields for a blocked handoff. Completed model text
  alone cannot qualify execution: require completed command events and an exact
  new current candidate. Stop before the next subject on missing native execution.
- Preserve the first stop and usage through cleanup. An AbortSignal races pending
  requests and allows at most two seconds to reconcile a delayed turn/start reply.
  Correlated events bind the turn immediately, so token/tool guards remain active
  even when the dispatch acknowledgement never arrives.
- Reject retired v1 protocols; real subjects are callable only through the frozen
  v2 matrix. The first planned subject is the canary, with no extra model probe.

## Source review and focused checks

The independent read-only reviewer identified two pre-response cancellation/guard
gaps during repair. Both were corrected before generation. The final narrow source
recheck found no further blocker. This is not formal lifecycle Independent QA.

Fifteen focused tests passed with zero failures, including never-resolving dispatch
responses, automatic token/reroute stops without human intervention, explicit abort,
honest blocked output, absent native commands and retired-protocol rejection.
The original fixture/oracle semantics remain unchanged.

An earlier complete-suite run on superseded candidate `305c320e` was intentionally
interrupted after the additional review finding. It is not full-verification evidence.
Complete verification of the candidate above must finish before model generation.

Final `npm run verify` passed on that candidate: **754/754**, zero failures,
cancellations or skips; test duration 432559.273291 ms. The local complete log is
retained outside the repository. Doctor after claim recovery: 36 pass, one existing
stale parallel-plan warning, zero failures. No parallel dispatch is used.

Fresh v2 protocol frozen before launch:
`sha256:73fd8ea310fd7f8785c4c54eba2451bbd71aa7fe282e3cc0060e22093b66f887`.
The prepared intermediate protocol was never consumed; source changes required a
fresh lab. No discarded preparation invoked model generation.

Generation-free native-enabled checks verified exact sandbox grants, denied sibling
reads, isolated Temple execution, fresh thread settings and four semantic controls:
current requirements pass and stale requirements fail in both arms. These controls
do not demonstrate that the model can execute native tools; only the canary can.

Before launch, the account reported Pro capacity remaining and no Credits balance.
This is a capacity check, not a conversion from account percentage to Token budget.
No reset, purchase or refill is used.
