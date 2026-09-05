# WI-0173 independent QA report

## Decision

**PASS** — independent technical review passed for exact candidate
`974d65782720e1264da869221cc38022ea60295f` (base
`44a1c9fc23efa067dcbe1f47beadb6f1b1ed64c8`). No required correction was
found.

This report is recorded by Lulu (`agent-lulu`) acting as Independent QA.
The Developer assignment and developer handoff identify Rikku (`agent-rikku`);
these are different Agent Identities. This report does not advance a lifecycle
stage, create normalized Evidence, or make a Release Gate decision.

## Candidate and environment

- Repository: isolated WI-0173 candidate worktree
- Candidate HEAD verified with `git rev-parse HEAD`:
  `974d65782720e1264da869221cc38022ea60295f`
- Base is an ancestor of candidate (`git merge-base --is-ancestor ...`: exit 0).
- The checkout contained coordinator-owned uncommitted lifecycle/evidence
  updates. They were neither edited nor included as implementation evidence;
  runtime tests exercised the candidate's committed source and isolated
  temporary fixtures.

## Independent checks

| Command / review | Outcome |
| --- | --- |
| `node --test test/handoff-revision.test.mjs test/high-assurance.test.mjs` | PASS — 10/10, 0 failures, 6.815 s. Covers Lean and Standard normalization of HEAD, branch, lightweight and annotated tags, abbreviated/full SHA; immutable retained records after refs move; invalid/missing/tree/blob/option-like inputs; non-Git and unborn repositories; and High-Assurance gates. |
| `node --test test/workflow.test.mjs` | PASS — 25/25, 0 failures, 24.562 s. Existing end-to-end lifecycle coverage remains green with a real Git fixture and exact candidate revision. |
| Candidate diff review: `git diff --check 44a1c9f..974d657` | PASS — no whitespace errors. |
| Handoff contract review: `src/assurance.mjs`, `test/handoff-revision.test.mjs`, ADR-0052 | PASS — `git rev-parse --verify --end-of-options <input>^{commit}` resolves before downstream handoff writes. Snapshot assertions compare Work Item JSON, event stream, and artifact bytes before/after each rejected input. Resolved SHA is stored in the handoff, Developer candidate, artifact, and event. |
| Authority/regression review: assignments, High-Assurance policy, `test/high-assurance.test.mjs` | PASS — Developer Rikku and Independent QA Lulu are distinct; existing High-Assurance prerequisites, risk/gate checks, normalized evidence, and derived-contract Doctor regression remain exercised. |
| Publication-language review: all three roadmaps, `package.json`, release-readiness, validation index | PASS — package version is `0.1.0-alpha.30`; roadmaps distinguish that published Alpha from unreleased `main`, label routing advisory, separate prepared experiments from measurements, and avoid universal savings claims. |
| Preservation review: candidate diff over `.ai-org/evidence` and `.ai-org/artifacts/WI-0172` | PASS — no candidate changes there; historical/sealed evidence is not rewritten. |

## Counterexamples challenged

- Invalid refs included a missing ref, `HEAD^{tree}`, `HEAD:docs/evidence.md`,
  `--help`, `--output=/tmp/temple-untrusted`, empty, and whitespace-only
  inputs. Each fails and the tests assert byte-for-byte unchanged handoff
  artifacts, Work Item record, and event log.
- A post-handoff commit and branch force-move cannot alter stored handoff
  evidence; the tests snapshot and compare the record after both operations.
- Legacy, Lean, Standard, and High-Assurance call paths share the commit
  normalization helper; non-commit input is rejected for each.

## Limitations

- This is focused independent QA, not a repeat of the Developer's full
  `npm run verify` (reported separately as 466/466 at this exact candidate).
  The focused tests above cover the changed behavior and existing affected
  workflow contract, but do not replace the release's full-suite evidence.
- Publication assertions are repository-document consistency checks; no live
  GitHub/npm query was performed.
- No model Provider was called. Performance and routing statements were
  checked for evidence-bounded language only; this report provides no new
  performance measurement or routing claim.
