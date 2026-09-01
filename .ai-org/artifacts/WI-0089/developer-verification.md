# WI-0089 Developer Verification

## Candidate

- Revision: `86b0cdf462f995efdaf93fa0e8eb173be000bc35`
- Developer: Rikku (`agent-rikku`)
- UI mode: `not-applicable`; this Work Item changes CLI, task-registry, policy, and documentation behavior rather than the Management Console interface.

## Automated results

| Check | Result |
| --- | --- |
| Repository, documentation links, and package boundary | Pass |
| Full Node.js suite | 270 passed, 0 failed |
| Focused workflow and orchestration suite | 27 passed, 0 failed |
| Runtime schema | 110 documents against 28 schemas; valid |
| Doctor | 35 pass, 1 unrelated stale-plan warning, 0 fail |
| Diff whitespace check | Pass after the candidate commit |

The tests cover Unicode normalization, structural-delimiter replacement, whole-title length, preservation of Position and Agent, claimed-Agent title generation, explicit registry refresh, selective refresh, metadata preservation, event idempotence, and orchestration output.

## Live Codex result

The first 86-code-point bounded-task title was accepted by the rename API but read back as a 58-code-point prefix plus `…`, hiding Position and Agent. The implementation was corrected to budget the complete title at 58 code points. A second rename and task-list readback returned the full corrected WI-0086 title with `Engineering Manager (Mog)` intact. The 48-code-point project-control title also remained intact.

The repository refresh changed all five stored `suggested_title` values. A digest of every other task-registry field was identical before and after, and a repeated refresh reported zero changes. The CLI performed no Codex app action; the two visible app renames were separately executed and read back.

## Boundary

No task was created, messaged, archived, dispatched, or model-switched. No release, push, tag, package publication, repository visibility change, or external tracker action occurred.
