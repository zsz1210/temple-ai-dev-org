# WI-0184 independent review: FAIL

Candidate: `85994e3b5e6310e0f684bc1299d1d1cb60e5b7f2`.

Reviewer: `agent-lulu`, assigned to `independent_qa` and `quality_evaluator`. Developer: `agent-rikku`, assigned to `developer`. The repository assignments and current Work Item claim confirm distinct Agent Identities. Review used claim `claim-20260905124032-13ac5f67` and prepared worker `worker-20260905124032-458ce7b0`; lifecycle updates remain with the integration owner.

Environment: Darwin arm64, Node.js v24.20.0, npm 11.19.0. HEAD matched the candidate; source, tests, package validator and documentation had no changes relative to that revision before and after independent checks. Concurrent canonical worker/Work Item updates were excluded from the implementation revision claim.

## Blocking finding

`src/context-packet.mjs` rejects a valid repository-root gate artifact solely because its reference contains no `/`. A regular UTF-8 file named `root-evidence.md` is a supported repository artifact under the existing gate validator in `src/work-items.mjs`, but packet acquisition classifies it as `unresolved-evidence-reference` and exits 1 with no source bodies. Neither the authorized brief nor ADR-0055 restricts local gate evidence to subdirectories.

Independent reproduction used the repository's fresh Lean delivery fixture, created `root-evidence.md` with `# Valid root evidence`, and recorded that path in `gate_evidence.extra`. Running `context packet` for the Developer with `--no-write --json` returned:

```json
{"exit":1,"problems":[{"code":"unresolved-evidence-reference","source":"root-evidence.md"}],"sources":0}
```

Expected: acquire this safe local file once, with provenance and its gate reason, unless an independent eligibility or safety condition fails. Fix the overbroad slash requirement while retaining rejection of normalized Evidence IDs, external references, unsafe paths and non-files. Add a regression using a valid root-level gate artifact. This is a correctness/compatibility gap, not a content leak; fail-closed behavior was preserved.

## Independent checks

- `node --test test/context-packet.test.mjs test/context.test.mjs test/release-package.test.mjs`: 22 tests passed, zero failures/skips, 11.399 seconds. Test-output SHA-256: `87d70240a607b40897227685008a691bd6b5604aa07ad0e608269c1728bb06c5`.
- Reviewed complete-file acquisition, selected-source deduplication, byte/hash provenance, separate Build/Test procedure selection, candidate/handoff binding, source and authority drift rejection, immutable canonical bytes, coverage disclaimers, and additive packet option validation. Existing Context capsule behavior remains covered by the independent Context suite.
- Additional bounded fixture probes passed: five individually permitted 240 KiB files exceed the 1 MiB aggregate limit and emit no bodies; a source through a symlinked parent directory fails without disclosing its sentinel contents; changing a selected source invalidates the previous expected digest with `STALE_PREVIEW`.
- WI-0185 packaging correction passes independent actual npm dry-run comparison against ancestor `7174489b0680e28a78d785e7d6c70c1cceef11d7`: 400 files become 402, exactly `src/context-packet.mjs` and `docs/adr/0055-transient-stage-material.md` are added, and none are removed. Unpacked size is 3,407,778 bytes. Actual manifest validation returned no failures. The validator diff changes only the reviewed file-count ceiling and explanatory comment; forbidden prefixes, required paths, allowed roots and the 8 MiB ceiling remain unchanged.
- The integration owner separately reports full verification at this candidate: 579/579, zero failures/skips, 106.917 seconds. This review did not duplicate that full run and does not substitute the targeted tests for full verification.

## Limits and disposition

No implementation repair, canonical lifecycle mutation, model generation, publication or frozen-comparison modification was performed. Source counts and bytes are acquisition observations, not Token/latency savings. Semantic completeness, instruction loading and mutation authority remain explicitly unasserted. Hostile concurrent filesystem mutation is outside ADR-0055's snapshot guarantee; no atomic-snapshot claim was tested or accepted.

WI-0184 fails this exact-candidate review pending the root-level artifact correction and fresh revision verification. The independently inspected WI-0185 package-boundary correction has no remaining finding. Preserve this failed review; use a separate record for the corrected candidate.
