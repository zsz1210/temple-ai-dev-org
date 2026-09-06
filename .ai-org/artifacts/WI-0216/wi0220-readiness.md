# WI-0220 fresh experiment readiness

Verdict: **PASS for one bounded live execution**, not acceptance of an outcome.
Reviewer: `agent-lulu`, distinct from Developer `agent-rikku`.
Prepared worker: `worker-20260906165739-8381dc6b`, WI-0219 Eval support.
Frozen source: `2aef01bd0ff943ffb54c2462f41b7efcab42326c`.

## Independently checked

- `src`, `scripts`, `test`, `bin` and `package.json` are unchanged from the
  `ba3bcc60f3836f4daa9ab3979149eee528acd541` behavioral candidate. Its recorded
  full verification is 666/666; this review does not claim a second full run.
- The format and command-policy suites passed 19/19 (240.978417 ms).
- The generated-command integration test passed (6281.278709 ms runner):
  twelve real local CLI executions across both roles/formats and sixteen
  synthetic diagnostic cases, with zero model turns. Legal command handling,
  source-body reuse and installed CLI transport remain covered.
- Fresh harness readiness passed: source/HEAD/instrument/request/provider-schema
  and untouched fixture bindings match the protocol. New human approval validates
  against that protocol and was unconsumed at review time.
- The fresh sandbox artifact passed for all four subjects: both formats entered,
  source bodies and entry identities matched, prior whole-body reuse was honored,
  and outside-fixture writes were denied. Full emitted 84529 bytes and Model
  79542 bytes. These are probe bytes, not model Token measurements. The sandbox
  artifact records zero turn requests and no model generation.

## Authority and stopping contract

Full, Model, Model, Full; distinct Builder/Verifier per delivery; Terra medium;
eight stages. Aggregate 640000 operational Tokens and 48 minutes remain hard
limits, as does six minutes per stage. The 80000 stage threshold is a warning.
Subscription allowance only; no purchase, refill, reset, retries, fallback or
extra judge. The new approval has execution Work Item WI-0220; the retained
instrument-schema WI-0216 identifier is not authority to resume prior runs.

Current bounded argument diagnostics retain enumerated classes and keyed
digests, not raw failed arguments. Their tests do not establish that the
unretained WI-0217 argument failure has been fixed. Model-authored variation,
quality failures and existing runtime guards can still stop this new run.
The executor must refresh account/provider/source checks, consume this approval
once, preserve partial costs and stop at the first existing failure boundary.
Two deliveries per format provide descriptive evidence only; uncontrolled
cache behavior remains a limitation. No routing default or general efficiency
claim follows from readiness.

## Exact bindings

- Protocol: `sha256:307917e227bc91147bf3d56530706f74a1039c53b379099ba43f856b49d380b7`
- Instrument: `sha256:6cc6ce18750db058b6c94e9204a701166895ff83f046893a3a8ca6985ad9ba1d`
- Sandbox: `sha256:7c2ed0374391981161fe2ec7e0c1bd6cdb8c1629bde64ae29bec7751b6baf8e1`
- Approval: `.ai-org/artifacts/WI-0216/wi0220-approval.json`

No blocker found within this readiness scope. No live model execution, canonical
state mutation, source edit or commit was performed by this reviewer.
