# WI-0182 independent readiness review — cycle 1

Verdict: **FAIL — comparison generation is not ready.**

Reviewer: agent-lulu, assigned quality_evaluator and independent_qa; Developer: agent-rikku. The active assignments are distinct. This review ran under claim-20260905113236-ef39b598 / worker-20260905113236-6489323b in Test. The coordinator owns lifecycle updates.

Exact candidate: `69c88ba329ff72ddd1fca5cecfde671995ae5a52`, compared with `b54a103`. All six reviewed source/test files matched that candidate on disk. Environment: macOS arm64, Node v24.20.0; supplied installed-provider rehearsal reports codex-cli 0.153.1. Behavioral source digest: `sha256:b594b1114ec314ec2a37a17987e0e58e1d304150ae20dc818cf9113c30db96a9`. Process v7 digest: `sha256:f41225f9fd3aeea9612c8c40b625ce8357f1c9f583c1e29e2156975cf3bd4b09`.

## Blocking counterexample

The design and stage prompt require rebuilding full generated Status views after the final lifecycle mutation. However, `scripts/delivery-command-policy.mjs:245` classifies both compact Status variants as `temple-status-compact` and retains no distinction for `--no-write`. `scripts/delivery-control-pair.mjs:457` accepts this operation alone as the required post-mutation Status treatment. `src/cli.mjs:1406` confirms that `--no-write` skips writing Status and Capability Registry views.

A fresh verifier can successfully run compact Context, release, transition to done, compact Status **with `--no-write`**, and compact Doctor. The classifier permits this sequence and treatment adherence reports `pass: true`, even though the required view refresh did not happen. This can label a run efficiency-comparable while omitting part of the declared treatment. Existing positive sandbox evidence does not exclude this alternative sequence.

Independent probe, executed from the candidate checkout with `node --input-type=module` (no provider or model calls):

```js
import { classifyCommandItem } from './scripts/delivery-command-policy.mjs';
import { treatmentAdherence } from './scripts/delivery-control-pair.mjs';
const root = process.cwd();
const command = 'node ./templew.mjs status . --compact --json --work-item WI-0001 --no-write';
const classification = classifyCommandItem({
  type: 'commandExecution', id: 'qa', status: 'completed', command, cwd: root,
  commandActions: [{ type: 'unknown', command }]
}, { root, arm: 'temple', stage: 'verify' });
const event = operation => ({ method: 'item/completed', exit_code: 0,
  classification: { allowed: true, operation } });
console.log(classification);
console.log(treatmentAdherence({ arm: 'temple', stage: 'verify',
  workflow: { pass: true, exact_handoff: true }, events: [
    event('temple-context-compact'), event('temple-release'),
    event('temple-transition-done'),
    { method: 'item/completed', exit_code: 0, classification },
    event('temple-doctor-compact')
  ] }));
```

Observed classification: `allowed: true`, `operation: temple-status-compact`; observed adherence: `compact_context_observed: true`, `post_mutation_compact_status_observed: true`, `post_mutation_compact_doctor_observed: true`, `pass: true`. Expected adherence: false until the required successful Status write is observed after the final lifecycle mutation. The events are a synthetic classifier/adherence counterexample, not claimed runtime model behavior.

Required next cycle: preserve the allowed read-only variant, distinguish it in normalized observation, and require the writing variant for this treatment. Add a regression proving a no-write-only post-mutation sequence fails while the actual required command succeeds. Developer must repair in a separate cycle, followed by revision-matched verification and renewed independent review.

## Other bounded checks

- Independently ran `node --test test/delivery-command-policy.test.mjs test/optimized-delivery-comparison.test.mjs`: 16 passed, zero failed/skipped, 92.276917 ms. These tests pass despite the counterexample.
- Inspected the supplied full verification log: 571 passed, zero failed/skipped, 99420.372667 ms. Did not repeat the full suite. Log `/tmp/temple-wi0182-full.log` digest: `sha256:3654af3cca86e87425123a575ef98c524a98589d5e6c00a03cf5007139b80d31`.
- Inspected the installed-provider rehearsal implementation, its supplied 2/2 log, and `sandbox-readiness.json`: four synthetic stages, matching command start/completion counts, successful oracle and lifecycle states, 85 operations, and two denied writes. Actual commands use installed-provider command/exec; synthetic actor replay and usage remain separate from real model generation. The report declares zero real provider thread/turn requests. This review did not rerun provider commands. Sandbox report digest: `sha256:41a849948ca4f9ac9b46106e771f380dae20154c46b6e612eae87dceb489c3b8`. Log `/tmp/temple-wi0182-sandbox.log` digest: `sha256:a4a8ad57013be8c89d4eac81ec46f6b31838c69ab7fa49368ffa625fc73bb707`.
- Actual CLI source supports the prompted scoped compact Status and compact Doctor. Doctor retains its full checks and healthy/nonhealthy exit code. Adherence rejects pre-lifecycle or unsuccessful diagnostic observations in existing tests; the missing write distinction is the blocker above.
- Both arms receive explicit stage stops, common product/tests/oracle obligations and unchanged per-stage limits. Screening has Terra ordinary-first and GPT-6 Temple-first, both medium, eight maximum stages, 640000 operational Tokens and 2880000 ms. Each stage remains 80000 operational Tokens and 360000 ms. One pair per model is not within-model order counterbalancing or evidence of efficiency superiority.
- Matrix/protocol/approval Work Item binding is propagated consistently. Tests reject a WI-0179 approval for the WI-0182 matrix, malformed IDs, route/limit drift, and stale matrix hashes. The code requires a fresh directory, frozen bindings and unused run locks. Human authorization provenance still belongs to the coordinator; this review creates no approval.
- Candidate diff contains no historical WI-0179 artifact changes. New source is isolated in this worktree; historical labs and approvals were not opened for mutation or reused. No claim of a fresh independent historical archive integrity audit is made.

No implementation was repaired. Only the two assigned WI-0182 readiness artifacts were written. No new comparison, model generation, external action, lifecycle transition, or approval was performed. This verdict concerns implementation readiness only.
