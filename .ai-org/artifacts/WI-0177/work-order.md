# WI-0177 — Profile-aware delivery instructions

## Authority and scope

The user approved the first instruction-audit repair batch and required isolation from the concurrent comparison. This is a maintainer-source correction under ADR-0045 and the existing Skill authoring contract, not a new workflow policy. Standard workflow, standard risk, bounded scope, no user interface. Integration owner: Mog; Developer: Rikku; Independent QA: Lulu, through a separate runtime.

Correct only the framework AGENTS delivery rule and `temple-work` entry/finish instructions, their scenario contract, and focused regression tests. Upgrade the checksum-clean installed copy in this worktree through the pinned CLI. No other project or worktree is upgraded. Core adoption and original provenance remain unchanged; no external instructions or dependencies are copied.

## Approved acceptance

1. Delivery instructions defer to the effective Work Item workflow and named gates. Standard and High-Assurance retain Independent QA; eligible Lean uses its existing Test-to-Done edge without claiming Independent QA or a release.
2. Task naming uses the CLI's `suggested_title`, not a competing title recipe. This work creates or renames no user-owned Codex task.
3. A known authorized Work Item previews read-only Context before broad reads. Previously read, unchanged source bodies may be reused only while available in the current session. A missing read, changed/unreadable source, changed authority, incomplete route, recovery, or pending bootstrap still requires the relevant explicit reads.
4. Read-only requests, claims, handoffs, evidence, profile eligibility, external authority, and managed-file checks are not weakened.
5. Validate contracts and real CLI behavior locally, then obtain independent candidate review. Static text/fixture checks do not establish model adherence, token savings, or performance improvement.
6. The comparison branch and its frozen inputs/results remain byte-identical. Submit a focused PR after checks; do not merge, release, publish, or start another comparison run.

## Design and risk review

The current overlay universally names the Standard stages while `.ai-org/core/workflow.json` already supports Lean. The Skill also duplicates an obsolete title and unconditionally reloads broad documents. Correct those three mismatches rather than modifying the workflow resolver, profile floors, model policy, context resolver, test harness, or other Skills.

The known-work entry will use `context resolve --no-write --json`; `source_manifest.selection_digest` hashes selected paths and their measured contents, but does not prove that any source was read or that unselected authority is unchanged. Explicitly retain this boundary. Use canonical Work Item and workflow configuration for lifecycle decisions, not the generated capsule as authority. Reuse ordinary implementation knowledge; no new optional reference bundle is needed.

Rollback: revert this candidate through the normal PR workflow, then apply a supported upgrade from the reverted source to this worktree if needed. Preserve evidence and the comparison lane. No deployment or external service changes are included.

## Concurrent comparison isolation

Read-only baseline: branch `codex/wi-0173-comparison-diagnostics`, commit `bba20cc140b72068827c7c858008c9768a16f067`, initially clean.

| Frozen path on comparison branch | SHA-256 |
|---|---|
| `.ai-org/artifacts/WI-0178/terra.protocol.frozen.json` | `88f8810639b8938f508a3e834d96ff03b82f015c52a2fe78f6e8e8430dff1475` |
| `.ai-org/artifacts/WI-0178/gpt6.protocol.frozen.json` | `c956a2e13170df7487303a75faf9df286a9825f86da45f44fc2a3b1b2ada147d` |
| `.ai-org/artifacts/WI-0178/comparison.json` | `25b71ddfecc2e6b69a12c937c09093b8bcd9d7347cce7b7c65771ad0cf64bfc4` |

That branch independently allocated WI-0177 and earlier IDs before this branch existed. The current Solo CLI allocates sequential IDs per checkout. This WI-0177 belongs to `codex/wi-0177-instruction-entry`; never substitute its records for the comparison branch's same-numbered historical record. Any later integration of that branch must reconcile those pre-existing namespace collisions explicitly. This change does not import or rewrite either history.

## Validation and stop

Run focused Skill contracts and the existing workflow/context/bootstrap/upgrade tests; run `npm run verify` once on the final behavioral candidate. Use an independent reviewer for exact-revision findings, including realistic instruction-following scenarios, while keeping any forward-test observation distinct from a controlled benchmark. Run local init → Doctor → read-only Status and checksum-safe upgrade checks. After evidence-only closeout, use fast checks and Doctor without repeating an unchanged full suite.

Stop after local implementation, evidence-backed organizational closeout, and a passing PR candidate. Broad rule deduplication, recoverable-error policy, future comparison protocol, performance claims, and main integration remain separate.
