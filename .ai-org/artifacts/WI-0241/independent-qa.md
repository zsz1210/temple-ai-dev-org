# WI-0241 Independent QA

Decision: **PASS for the bounded design and generation-free preparation candidate**.
This is not a live experiment result, a savings claim, or launch/release authority.

## Identity, revision and environment

- Reviewer: `agent-lulu` (Lulu), Position `independent_qa`, Principal `human`.
- `.ai-org/project/assignments.json` assigns Developer to `agent-rikku` and
  Independent QA to `agent-lulu`; the identities differ. WI-0241's released
  Developer claim and developer handoff also name Rikku.
- Active QA claim: `claim-20260907142321-49c3b663`; assigned runtime worker:
  `worker-20260907142321-fd6a3fb9`, attached to `/root/wi0241_qa`.
- Exact candidate: `afb048d10a7c1554afa75b8121d733d753b0a49b`.
  Reviewed against `c65e72a8`; checkout HEAD was
  `98b914761ce84d1557455eb94687847281d5e6bf`. Git comparison confirms later
  changes affect evidence and organization records, with no executable, test,
  instruction, dependency or package input changes since the tested candidate.
- Independent local test environment: macOS, Node.js `v24.20.0`.
  Frozen actor environment records standalone Node.js 24.19.0 and
  `codex-cli 0.153.4`; the provider runtime was not relaunched by this reviewer.
- Review scope is this report only. No implementation repair, lifecycle mutation,
  preparation rerun, model turn, approval consumption or old-lab mutation occurred.

## Independent observations

`node --test test/continuity-live-runner.test.mjs` completed with exit 0:
23 tests, 23 pass, 0 fail/cancelled/skipped/TODO, duration 11,674.161833 ms.
This is fresh QA evidence, not a replacement for complete verification.

The suite exercises valid old four/six layouts and the new two-condition layout;
missing, extra, swapped and duplicate subjects; wrong arm, previous-instruction
variant, pair and root; mixed preparation; wrong digest and enlarged envelopes.
It also independently reruns cancellation races, delayed replies, absent native
dispatch, trailing/missing usage, reroute and uncertain cleanup counterexamples.
These are offline simulated-provider tests, not native model observations.

The complete `770/770` verification on the exact candidate is reused from
[verification](verification.md), after checking that its behavioral inputs remain
unchanged. Its recorded 54/54 follow-up and CI result retain their narrower scope.
No new reason was found to rerun the full suite. The coordinator must perform the
applicable prose/state checks after joining this report and its concurrent records.

Read-only inspection of the fresh lab ending `temple-continuity-live-ftTGJ4`
confirmed the following:

- Recomputed protocol digest:
  `sha256:3568e1f6ec0bf33665d0275661829a9c10c8a0ccde4b3f2fc4dfa453d2333dc2`.
- Version `continuity-incremental-approved/v1`; exactly stable then changed-spec,
  both current compact Temple. Model `gpt-5.6-terra`, effort `medium`, 100,000
  Operational Tokens and 480,000 ms per subject; 200,000 tokens and 1,200,000 ms
  aggregate. Retries 0; fallback, purchase and reset false.
- Recomputed actual coordinator instrument equals its frozen fingerprint:
  `sha256:f9c5f7de735db9d037d1f14370d9df5415e5a89aab44579ac7844193a43e2537`.
- Actual fresh and prior WI-0239 compact bundles both match their manifests and
  each other:
  `sha256:ddbf85b0a72e5c4a7bee0816f3e6c746c6d70fdd44263da1286535400f582ef6`.
  Their recorded provider schemas and CLI versions also match.
- Stable HEAD is `6a1ba6b71be2c922212a043ebe1b2f2c728d7a01`; changed-spec HEAD is
  `1ed8448814fa4cc56fe1441bfed4947862754298`. Each whole visible worktree matches
  its frozen pre-work Git tree. No finished prior actor checkout was adopted.
- Comparing prior compact pre-work trees independently reproduces 124/133 and
  125/134 byte-identical tracked files. The same nine differing paths reported in
  [readiness](readiness.md) are present; JSON differences are initialization,
  assessment, generated and installation timestamps plus historical verification
  revision/output/timing. Product, specification, tests and instructions match.
  Whole seed fact digests are therefore not claimed identical.
- Retained qualification reports configured-thread controls passed with no model
  generation and confirmed server exit; oracle controls accept current and reject
  stale requirements in both arms; the record-descendant oracle reports 46 cases
  and native observation qualification reports 9/9. These retained preparation
  observations were inspected, not regenerated or represented as QA model runs.
- Fresh `consumed.json`, `run.json` and `seal.json` were absent. The old WI-0239
  protocol and result still match their existing seal.

## Review judgment and limits

The additive implementation selects a fixed matrix while retaining the old
protocols, model request, per-subject ceilings and typed continuation rules.
Inspection confirms digest/envelope/source checks precede approval consumption;
the exclusive `wx` consumed marker prevents replay. Runtime, fixture, usage and
cleanup checks remain in the existing execution path. No live replay was attempted.

The Learning document explicitly remains a proposal. It covers evidence-triggered
triage, no-insight and read-only skips, deduplication, ownership, applicability,
contradictions, recovery, privacy, intentional promotion and subsequent outcome
feedback. It neither activates recurring behavior nor enters the distributed
actor runtime. This is consistent with the Engineering Learning authority boundary.

No blocking counterexample was found for the named preparation acceptance. The
first subject remains a native-tool canary; native execution coverage is not yet
measured. Conservative shared stops can censor the second condition, and the
100,000-token cap may be reached again. Historical controls are not contemporaneous
paired controls: cache, ordering, service time and regenerated provenance limit
comparability. No causal efficiency or Learning-effectiveness conclusion follows.

This Standard-profile QA pass may be joined by the coordinator. Fresh execution
authorization and launch preflight belong to the separate execution work item;
Release Gate remains a separate owner action. Stop after the authorized batch and
its report, preserving failed, censored and missing observations without retries.
