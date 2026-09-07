# WI-0235 Independent QA

Decision: **PASS** for the bounded offline acceptance criteria on candidate
`68be154276fe2648a35eadf6c3e59c665ced2ea9`, compared with `0e4936be`.
No blocking defect was observed. This decision does not approve release,
publication, a live experiment or measured Token savings.

## Identity, authority and environment

Reviewer: Lulu (`agent-lulu`), Position `independent_qa`, Principal `human`;
runtime `/root/wi0235_qa`, worker `worker-20260907090523-47a1e5ce`, active claim
`claim-20260907090523-008ab914`. Date: 2026-09-07.
The current assignments, collaboration membership, worker and Work Item agree.
Developer is Rikku (`agent-rikku`), a different Agent Identity. Quality Evaluator
also uses Lulu; that earlier runtime's execution is attributed separately below.
The effective workflow and risk tier are Standard; no High-Assurance normalized
evidence requirement is asserted or waived. The recorded overlap resolutions
permit this evidence-only review while WI-0236 waits before shared source edits.

Read AGENTS.md, TEMPLE.md, the installed temple-work Skill and assurance reference,
the routed Work Item, design, report, evaluator review and handoff. Compact QA
context selected digest
`sha256:85dc7663aa6ab7c0d937a9f9e17916752d1eb2ad2d8c2d8c7d2e8519546f2228`.

Execution environment: Node.js `v24.20.0`, Darwin arm64, local dependencies in
the reviewed repository worktree.
Checkout HEAD was `2fc0013986ea6218c394772e0cfaaaa88aca6148`; the checkout contains
later evidence and organization bookkeeping. The following read-only comparison
returned no paths before testing:

```sh
git diff --name-only 68be154 -- scripts src test bin packs project-overlay package.json package-lock.json .agents TEMPLE.md temple.lock docs
```

Thus executed source, tests, instructions and dependencies match the exact
candidate; this is not a claim of a clean whole worktree. Comparing candidate
against `0e4936be` for `.ai-org/artifacts/WI-0234` and
`scripts/continuity-codex-adapter.mjs` also returned no paths. Historical experiment
artifacts and the legacy adapter remain unchanged.

## Independent acceptance challenge

The Lean recipe still requires native/bootstrap obligations, applicable whole
reads, eligible claims, real product evidence, exact revisions and distinct
verification. Optional compact navigation does not grant authority. Stage finish
retains its own guard/diagnostic obligations and does not authorize later stages.
The installed recipe test independently executed local installation/upgrade and
completion: one handoff, released claim, Test ownership, exact candidate and full
diagnostics passed; project-owned integration policy was preserved. Its 3722-byte
compact response is a fixture observation, not autonomous model performance.

Completion rejects actual blockers, unavailable/failed tests, invalid candidates
and wrong owners. A failed oracle still rejects completion when a defect is
declared as downstream work. The assessor receives oracle truth from the runner;
it is not itself proof that a supplied SHA exists. Runner inspection confirms the
independent oracle receives the declared revision and fabricated/current-candidate
failures stop dispatch. Product, handoff and administration remain separate.
Free text is not automatically interpreted as a defect, and an incomplete oracle
cannot establish absence of all possible defects.

New command summaries retain fixed counters and coverage flags without raw
commands, paths or output. Boundary probes confirmed exact UTF-8 counting,
2 MiB capping, event deduplication, item limits, and unavailable versus observed
empty output. Authored request bytes leave native and total context unknown.

Nonblocking limitations remain explicit:

- `sed -i s/a/b/ quote.mjs` is classified as `reading`, while a shell-wrapped
  `cat` is `unknown`. Categories are lexical hints, not proven work intent or
  permission checks; native category coverage is unmeasured.
- Earlier evaluator evidence reproduces top-level completion-event count 2
  versus deduplicated command-item count 1. These counters are not interchangeable.
- Output caps/absence, unknown categories, provider formatting, cache and native
  context prevent a complete context or command-level Token accounting claim.
- Offline fixtures and mocked boundaries do not qualify the live native tool
  route. Changed schema/protocol require fresh qualification and authorization;
  no historical result is rescored. WI-0236's planned matrix is outside this pass.

## Execution and evidence provenance

This QA runtime ran `node --test test/continuity-delivery-contract.test.mjs`:
exit 0, **5 passed**, zero failures/skips/cancellations, **2140.998959 ms**.
It independently ran an additional module-import stdin probe with **20 passing
assertions**, exit 0. The probe covered passing completion; whitespace blocker;
whitespace-only test command; fractional test exit; uppercase SHA; wrong owner;
null blockers; excessive downstream entries; unknown schema property; a failed
oracle despite downstream defect prose; nonboolean oracle truth; byte-cap exact
boundary and overflow; duplicate event plus item-limit accounting; no raw data in
serialized counters; unavailable and empty authored input; unknown total context;
shell-wrapper attribution; and the known sed classification limitation.
Passing the last assertion records that limitation, not correct semantic intent.

Full-suite evidence is reused by reference from
[Quality Evaluator review](independent-review.md), with the matching source
comparison above. This QA runtime read the preserved
`/tmp/wi0235-lulu-verify.log` summary: **759 passed, 0 failed, 0 cancelled,
0 skipped**, **187096.3845 ms**. The earlier Quality Evaluator runtime ran that
suite; this QA runtime did not rerun or claim authorship of it. Its separate 21
adversarial assertions likewise remain evaluator evidence.

Report-only verification: `npm run verify:fast` exited 0; repository, documentation
link and package checks passed, followed by **54/54 tests**, zero failures/skips/
cancellations, **1014.11425 ms**. The final source comparison above again returned
no paths. This paragraph records completed verification without changing behavior.

Only this report was authored by the QA runtime. No implementation, canonical
state, experiment output, commit or external/live call was changed. The parent
owns worker completion, evidence handoff and later lifecycle decisions.
