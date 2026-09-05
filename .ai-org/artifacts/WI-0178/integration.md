# Integration and validation report

Integration owner: Mog / `agent-mog`.
Source candidate: `6521fc50047478ced59cd9fe0a65f1d4d2c4c3df`.
Base: `18c954cfe7f276c46b89a680f05224da5f80ac33`.

## Delivered scope

- Eligible Lean delivery composes handoff, claim release and Test entry through shared validators. Same-operation recovery and historical replay preserve exact revision, identity, rework, evidence and profile guards. It does not run tests or accept the work.
- Optional compact Context presents ownership, scope, candidate, next edge, references and warnings without granting authority or recording that instructions were read. The full response remains compatible.
- The lifecycle Skill keeps its boundaries in the entry and routes conditional Lean, parallel and assurance/recovery instructions to references. Installed managed copies were upgraded through the repository launcher.
- New CLI surfaces distinguish invalid input, stale preview, pending recovery, rejected guards and uncertain execution; they never execute an automatic retry.

## Validation

| Evidence | Result | Interpretation |
|---|---|---|
| First full verification | 514/515; one Console refresh timeout | Retained failure; measurement and full-test startup overlapped |
| Isolated existing Console suite | 8/8; 4.022 s | Refresh path passed without changing source or deadline |
| One complete repeat, no other test runner | 515/515; no skipped tests; 91.813 s test phase | Repository, links, package boundary and local regression pass for the exact candidate |
| Independent QA | 42 focused tests plus actual CLI interruption/recovery/replay | Separate runtime and Identity; see `independent-qa.md` |
| Local administrative paths | All six fixture entries and product tests passed | Counts/output only; no model generation |
| Comparison preservation | Clean source checkout; all three frozen SHA-256 values unchanged | No mutation, rerun or relabeling of the other task's experiment |

The first Console timeout has no proven root cause. Its code/test are identical to base. No timeout increase, skipped test or source patch was used to obtain the repeat pass. A recurrence warrants a separate focused investigation; this report does not claim that flakiness was fixed.

The optional external Python Skill validator was unavailable because PyYAML is absent. Repository frontmatter, reference, scenario, init and upgrade checks passed instead; see developer evidence. Browser redesign and live-model adherence are not part of this slice.

## Directly measured local changes

The readable JSON counts below come from `local-measurements.json`. All paths reached the same objective Test entry. A competent existing low-level path already combines release with transition; the three-command documented path is not the only baseline.

| Administrative path | CLI invocations | Serialized output bytes |
|---|---:|---:|
| Separate handoff, release, transition | 3 | 11,077 |
| Existing handoff plus release-on-transition | 2 | 7,533 |
| Composed deliver | 1 | 666 |
| Optional preview plus deliver | 2 | 1,329 |

Each fixture's setup still used four CLI invocations. A shell script can batch multiple CLI invocations into one tool call; the table is **not** tool-round-trip or model-turn counts. Times in the raw report were observed during concurrent full-test startup and are not an isolated latency comparison. Provider Tokens, human effort and model turns were not measured.

Entry-file UTF-8 byte counts at base versus candidate:

| Maintainer source | Before | After |
|---|---:|---:|
| `project-overlay/.agents/skills/temple-work/SKILL.md` | 6,599 | 3,690 |
| `project-overlay/AGENTS.md` | 6,421 | 6,164 |
| `project-overlay/TEMPLE.md` | 13,228 | 12,819 |

The Skill entry is 44.1% smaller, but the three conditional references total 6,402 bytes when all are needed. This is layering, not removal of all that information. It may increase a full-load case and does not by itself prove lower Tokens.

For this checkout's WI-0178 at `independent_qa`, one same-state read-only observation emitted 9,305 bytes in full mode and 6,927 in compact mode. Both used `--position independent_qa --no-write --json`; only `--compact` differed. This is a single payload-size observation, not a representative workload or instruction-loading proof. A minimal synthetic case was nearly equal (3,734 vs 3,722 bytes); compact output is not guaranteed to be smaller for every record. Source/authority measurements are point-in-time reads, not an atomic snapshot. Mutations still revalidate governing files.

## Follow-up and stop

After PR review, a new matched protocol can test whether the reduced entry and composed operation improve accepted delivery. Keep the old experiment sealed. Exercise the updated command policy locally first; retain a competent ordinary path, fixed model/effort/starting task, counterbalanced order, independent quality criteria, and separate Token/elapsed-time accounting. Do not infer that historical fixed-order pairs are a causal control for this revision.

This slice stops at a verified PR candidate. It does not merge main, publish npm, change routing policy, start a new model experiment or change either comparison history. Rollback is a normal revert PR plus supported upgrade after investigating or recovering any pending journal; never delete a journal to bypass its protection.

## Final evidence-only checks

- Organizational closeout recorded `done` and explicitly did not perform an external release.
- Doctor after rebuilding the plan: 37 pass, zero warnings or failures; 93 checksum-managed files and no active runtime workers for this Work Item.
- `npm run verify:fast` after closeout: 54/54, zero skipped, 1,118.536 ms test phase; repository, links and package checks passed.
- `git diff --check` passed. Code, tests, docs, installed/source Skills, package metadata and lock are byte-identical to the independently reviewed `6521fc5` candidate after the organizational evidence updates.
- Main remained clean at `18c954c`; the comparison checkout remained clean with the three pinned digests unchanged. No leftover test runner or service was intentionally left running by this work.
