# WI-0186 Independent QA: FAIL

Candidate: `ea8ef29799a4bbcde94c4ff296a37fdb48b031c0`; comparison baseline: `68af6ff`. Environment: Darwin arm64, Node.js v24.20.0. Source, tests, scripts and documentation remained byte-identical to the candidate during review.

Identity: assignments and collaboration records assign Independent QA to `agent-lulu` and Developer to `agent-rikku`. These are distinct Agent Identities. This review used prepared worker `worker-20260905130828-87bb7969` and claim `claim-20260905130828-fa006bba`. No implementation or canonical lifecycle state was changed by QA.

## Blocking finding: explicit full Context sources are still projected

ADR-0056 and the brief require complete bodies when a Context route independently requires either structured source. A valid, explicitly pinned route to both inventories does not enforce that fallback.

Reproduction using `fixture()` from `test/helpers/lean-delivery-fixture.mjs`:

1. Add this route to the fixture's context map and pin its ID in the fixture Work Item's `context_refs`:

```json
{
  "id": "qa-full-inventories",
  "kind": "documentation",
  "title": "Whole inventories",
  "summary": "Read complete inventory sources",
  "paths": ["temple.lock", ".ai-org/core/positions.json"],
  "tags": [],
  "positions": ["developer"],
  "work_items": ["WI-0001"],
  "read_when": ["Need source records"],
  "owner_position": "developer",
  "status": "active"
}
```

2. Acquire default full and `--material stage` packets for the fixture's Developer, using `--no-write --json`.
3. Both complete successfully. The stage packet's `entry.references.context_routes` contains the pinned route and both paths, proving that the route is selected.
4. Both source rows nevertheless have only `reasons: ["authority-and-entry"]` and are emitted as `structured-projection` / `known-stage-selection`.

| Explicitly required source | Original bytes | Emitted body bytes | Body equals full source |
| --- | ---: | ---: | --- |
| `.ai-org/core/positions.json` | 4,293 | 963 | false |
| `temple.lock` | 20,183 | 6,572 | false |

Expected: `whole-source`, `independently-required-whole-source`, and byte-identical full bodies. The counterexample violates the accepted conservative fallback contract despite successful acquisition and correct hashes.

Cause: `compactContextEntry` removes authority paths from the detailed `source_manifest.sources` list, retaining their paths in `authority_snapshot`. `acquireContextPacket` restores those paths solely with the `authority-and-entry` reason. It does not restore the selected Context-route reasons from `entry.references.context_routes`. The stage projection guard therefore mistakes an explicitly required full source for authority-only material. Governing specification references that coincide with authority paths share this potential category-loss boundary and must also be tested during the repair cycle; this report does not claim a separately executed specification counterexample.

Required follow-up: preserve independent source-selection reasons before deciding projection eligibility, add a valid pinned Context-route regression and a governing-specification reference regression, then qualify a new exact candidate through development verification and independent review. QA did not repair the implementation.

## Passing bounded evidence

- Independently executed packet suite: 16 passed, 0 failed or skipped, 22.243 seconds. Local log SHA-256: `74740a6d1b360229f412d74d74a4fb6fb01ae9d4492b19607dcf78f2bd317e55`.
- Independently executed release-package suite: 2 passed, 0 failed or skipped, 0.062 seconds.
- Additional probes confirmed whole-body fallback for unknown schema versions, duplicate lock/Position records and a missing required Position; a changed restriction in an omitted Position rejects the previous stage binding. Integration acquisition retains canonical bytes, and independently recomputed original-source, emitted-body and packet digests match.
- Existing focused assertions verify default/full v1 compatibility, exact managed-entry observations rather than root-prefix ownership, complete retained Position restrictions, gate-reference/recovery/ambiguous-scope fallback, full-source stale binding and acquisition failures. Passing these tests did not cover the blocking Context-route counterexample.
- Independent actual formatted CLI measurements: Build 90,861 to 80,975 bytes, a 10.880% reduction; fresh Verifier 94,752 to 86,374 bytes, an 8.842% reduction. Verifier observations differ from the committed fixture measurement by two bytes of dynamic test evidence; the reduction is consistent. Full acquired bytes remain unchanged and required reads remain unwaived. No duplicate representation manifest is emitted in the binding.
- Independent npm dry-run inventory comparison: 402 to 403 files; the sole addition is `docs/adr/0056-stage-material-projections.md`, with no removals. Candidate unpacked size is 3,420,031 bytes. Package exclusions and the 8 MiB ceiling are unchanged in the reviewed diff.
- Coordinator-reported full verification is 587/587 passed, no failures/skips, 107.410 seconds, with Doctor 37 passed and no warnings/failures. These are coordinator evidence, not a second full execution by QA, and do not override this finding.

The projected documents retain their original document schema inside an explicitly derived v2 source wrapper. Under ADR-0056's packet interface, representation labels, selection metadata, separate original/emitted hashes and coverage disclaimers are sufficient; no standalone canonical-file export is promised. A future extraction/export interface would need to preserve that envelope.

Some initial QA harness attempts used invalid/unpinned route inputs and an incomplete baseline archive file list; these were corrected locally without source changes. The final blocking reproduction uses the valid pinned route above and confirms its selection in the returned packet.

Disposition: FAIL this exact candidate pending a separate repair cycle. No model experiments, Token/latency savings claims, quality-superiority claims, merge, publication or external release are included.
