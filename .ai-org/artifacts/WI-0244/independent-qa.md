# Independent QA: WI-0244

Verdict: **PASS within the approved diagnostic scope.** No blocking findings.

## Identity, revision and environment

- Independent QA: `agent-lulu` (Lulu), runtime `/root/wi0244_qa`, governed worker
  `worker-20260907152131-973c5646`.
- Developer: `agent-rikku` (Rikku). The active assignments, Work Item claim history
  and Developer handoff confirm different Agent Identities. QA's active claim is
  `claim-20260907152131-021bfb5e`.
- Exact candidate: `b0a87c88798491ecf500c67cb2f857272dbb5567`.
- Compared parent: `fad0d67d6abfdfc21559f0a00ea978e2150e0601`.
- Branch: `codex/continuity-cost-audit`; Node.js `v24.20.0`, Darwin arm64.
- The effective workflow and risk tier are Standard. High-Assurance normalized
  evidence requirements do not apply to this Work Item.

The read-only routed context selected this candidate and QA assignment. HEAD was
checked before and after testing. `git diff --quiet` against the candidate for
`scripts`, `test`, `package.json` and `package-lock.json` returned exit 0. Concurrent
organization and evidence changes were present and excluded from behavioral
verification; this was not a clean whole-tree checkout.

## Independently executed checks

`node --test test/continuity-delivery-contract.test.mjs` exited 0:

```text
tests 9
pass 9
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 2334.3875
```

The actual subject-ledger test confirms completed-event integration, unknown
reason count/byte propagation, unchanged stop state and absence of raw sentinel
command/output text. The real local Lean fixture also passed; its result is
offline structural evidence, not model performance.

An additional `node --input-type=module` inline assertion check loaded the parent
observation module through `git show` into memory and compared it with the
candidate. Thirty inputs included missing/non-text commands, empty commands,
16,384/16,385-character boundaries, quotes, expansions, chaining, malformed and
nested wrappers, unsupported sed/rg forms, excessive word counts and recognized
commands. Missing output, Unicode output, duplicate IDs, a missing ID and an event
beyond the configured cap challenged legacy-field preservation. Result, exit 0:

```json
{"cases":30,"legacy_fields_identical":true,"unknown_events":21,"unknown_reason_keys":6,"unicode_bytes_conserved":true,"privacy_sentinel_absent":true,"prior_schema":"continuity-command-observations/v2","current_schema":"continuity-command-observations/v3","provider_calls":0}
```

Both six-key maps conserved unknown counts and observed bytes. The focused suite
additionally passed the 2 MiB output cap and missing-output assertions. Source
review confirms reason derivation runs only after an unknown classification,
returns one of six fixed values and adds no retained raw fields. The classifier
and existing acceptance guards are unchanged.

After creating this evidence artifact, `npm run verify:fast` exited 0: repository,
documentation-link and package-boundary checks passed; 54 tests passed, zero
failures/skips/cancellations, 1,033.22725 ms test duration. This checks the prose
addition and does not replace the exact-candidate behavioral suite.

## Evidence review and limits

Reviewed [design](design.md), [report](report.md), [audit](audit.json),
[offline replay](offline-check.json), [verification](verification.md), and the
narrow source/test diff. The full-suite result is Developer evidence: 794 passed,
zero failures/skips/cancellations, 179,677.476416 ms at the exact candidate. QA did
not duplicate that suite or its 10,000-event timing sample.

The candidate has no diff to WI-0242 artifacts, the live runner, actor adapters,
delivery contract or repository Skills. Historical v2 observations remain
unchanged. The test parsing a small v2 JSON record alone would not prove sealed
history preservation; the unchanged Git scope supplies that preservation check.
QA did not independently recompute historical seals or reconstruct the audit's
durable-operation counts.

The report correctly bounds its claims: 14 unique completed command/cwd hashes
show no exact repeated signature, but do not exclude semantic rereads. One set of
recorded delivery operations does not enumerate read-only preparations. Unknown
operation costs, raw command bodies and per-operation Tokens remain unavailable.
The new reasons describe parser coverage, not redundancy, safety or measured
Token savings. Zero observed bytes can mean unavailable output; capped bytes are
lower bounds. No historical reason backfill is justified.

No implementation repairs, provider calls, canonical-state mutations, commits or
release actions were performed by this QA runtime. The parent owns worker join,
evidence checks and subsequent lifecycle handling. This verdict is not release,
publication or live-experiment authorization.
