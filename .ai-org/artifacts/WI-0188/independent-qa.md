# WI-0188 Independent QA — FAIL

Candidate: `88ab5970b8410f3b4baa99be50ff26796bb51250`. Environment: Darwin arm64, Node v24.20.0; branch `codex/wi-0188-lean-entry`. Candidate implementation/test/template files were unchanged during review; root separately updated lifecycle/projection records and ran the full suite.

Assignments and claim independently confirmed reviewer `agent-lulu` (Quality Evaluator / Independent QA) differs from Developer `agent-rikku`; active review claim `claim-20260905141644-a77d6288` pins this candidate. Worker: `worker-20260905141644-4a85d8c7`. Reviewed the compact Context route, brief, ADR-0058, installed procedure, source changes and managed-file boundaries. No implementation repair or canonical mutation performed.

## Blocking findings

1. **Recorded draft shared contract still selects Lean material.** Using the initialized Lean fixture, set `contract_status: "draft"` and `shared_contract_refs: ["docs/brief.md"]` on the existing Build Work Item. This is a supported contract-status value and the referenced file exists. Invoke `context enter` with its existing Developer Identity, Principal and claim, plus `--no-write --json`. Actual result: exit 0, `status: "eligible"`, `reasons: []`, and a packet. Expected: explicit body-free fallback while the shared contract is unsettled. `inspect()` checks nonempty scope/acceptance/affected paths but omits shared-contract status; existing readiness identifies only `stable` or `not_required` as stable. This violates the approved unclear/ambiguous-contract fallback boundary. All canonical bytes remained unchanged by entry; this is an eligibility error, not an observed unauthorized write.

2. **Installed Skill contract regression.** Independently ran `node --test --test-name-pattern='repository Skill set' test/skill-policy.test.mjs`: exit 1. The expected reference set contains only three references; the installed Skill now correctly includes `references/lean-execution.md` as a fourth. Root independently reported the same failure in its full run. Reconcile the explicit scenario/structure assertion with the intended new procedure, preserving checks for all required references, then rerun full verification on the repaired candidate.

## Passing bounded evidence

- Independently ran `node --test test/context-enter.test.mjs test/context-packet.test.mjs`: **28 passed, 0 failed/skipped**, 48.278 seconds. This includes initialized installed-launcher cold Builder and distinct fresh Verifier entry/claim/finish, exact candidate and evidence coverage, read-only state, recovery/diagnostic fallback, stale binding, full-source restoration and existing packet compatibility.
- Additional isolated probes: expired membership falls back with `ineligible-agent`; changing the required execution procedure rejects the old entry digest; symlinked policy authority falls back with no packet. The draft-contract counterexample above is also preserved. Probes assert unchanged canonical bytes around every entry invocation.
- Independent npm dry-run inventory: **409 files**, 3,466,438 unpacked bytes. New surface paths reviewed: `src/context-enter.mjs`, ADR-0058 and the core `lean-execution.md` reference. Managed changes are confined to exact lock entries; repository-owned AGENTS instructions remain outside blanket ownership.
- Selected claim/finish navigation explicitly labels the nested compact next step as the existing-route alternative. Recovery advice preserves the original request and does not promise that repeating entry repairs state. Required reads, bootstrap and provider-loading limitations remain explicit.

## Evidence fingerprints and reproduction

Local raw focused output: `/tmp/wi0188-qa-focused.log`, SHA-256 `472cae36a6e146831d41bd2b7638a8362dc5cf612913c32e4336f82e9a94e135`.

Extra probe script: `/tmp/wi0188-qa-probes.mjs`, SHA-256 `a8d451f6af3af34c0f057d1055743ab18830b9db7b3a9cc1d94deb04f7f02ca8`; output `/tmp/wi0188-qa-probes.log`, SHA-256 `e5752ed2f890438bb6bb925812d3b99105f5ead319d1f74e20d86ecdfdc37e26`. Reproduction uses `test/helpers/lean-delivery-fixture.mjs`, confirms fixture repository integration locally as in the entry tests, changes only the two Work Item fields listed above, and runs the actual CLI. Restore fields after each case and clean the temporary fixture.

Independent failing Skill output: `/tmp/wi0188-qa-skill-policy.log`, SHA-256 `a6d6fffa2d815256da0d95a3ae0de3b6b10207c004128dddae021f81a2e7c507`.

Package inventory: `/tmp/wi0188-qa-pack.json`, SHA-256 `172e248cfa7ff682a73cfdc2d221bfec60d9c1e09bc08d2ffe33e5ed076bf3c8`.

No model/provider generation, autonomous instruction-comprehension evaluation, Token/latency comparison, merge or publication performed. Focused test duration is an observation under concurrent root verification, not a speed benchmark. The candidate is **not accepted**; preserve this report and qualify a corrected exact candidate in a separate review cycle.
