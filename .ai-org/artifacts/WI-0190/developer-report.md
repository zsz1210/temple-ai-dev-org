# WI-0190 Developer report

## Candidate and scope

- Candidate: `50ae4f50fcf74d8468e09956e44e1eb9da99ef71`.
- Base: `b15b741`, preserving the existing Lean branch chain and sealed WI-0189 evidence.
- Original Temple instruction changes under the maintainer workflow; no external text copied and no optional integration installed.
- Updated distributed and self-host instruction routes, support reference, ADR, scenario documentation and package/reference checks. Managed self-host copies and lock were synchronized by the pinned upgrade; only the project-owned AGENTS integration block was patched directly.
- No changes to `src/`, prior experiment artifacts, workflow schemas, provider/model policy, naming or runtime guards. The main worktree remains unchanged.

## Behavior contract

Sequential delivery requires no parallel plan. A bounded informational helper remains under parent authority, returns cited findings and uncertainty, and cannot mutate project state or certify formal verification. Writes, shared resources, independent ownership, unclear authority and formal QA use existing governance. Native delegation availability, permissions, required instructions and bootstrap remain applicable; the reference is not a sandbox enforcement mechanism.

Existing stage-completion wording and Lean implementation are retained. Successful composed finish diagnostics may satisfy their unchanged scope without duplicate calls. A handoff is not acceptance, failed diagnostics stay unresolved, and historical receipts are not fresh verification. Mandatory project tests and separate Independent QA remain required.

## Validation

- Final `npm run verify` on the candidate: exit 0, **632/632 passed**, no failures, skips or cancellations; test wall time **149179.820875 ms**.
- Repository, documentation-link and package checks passed: 115 overlay files; package 411 files, 885319 packed bytes, 3475649 unpacked bytes. No registry publication occurred.
- New tests validate explicit instruction boundaries and real initialization/upgrade distribution, including a synthetic older installation without the new managed reference and preservation of a project-owned Skill.
- Focused support/Skill tests: 5/5 passed. Self-host instruction-parity regression passed after synchronization.
- `git diff --check` passed. No source or prior sealed-evidence diff against the base.
- Upgrade Doctor: 36 passes, zero failures, one retained stale parallel-plan warning. This item is sequential; no dispatch was attempted and the stale plan was not used or silently refreshed as authority.

## Corrections during development

The initial repository check rejected a framework-brand phrase in the project-facing reference; it was rewritten as project-neutral wording. The new ADR and support reference required reviewing two additional package entries (409 to 411), preserving size and forbidden-path limits. Earlier full runs exposed the explicit Skill reference inventory and self-host instruction parity checks; both were corrected without removing assertions. The final full run supersedes those failed candidates.

## Evidence limits and handoff

Static scenarios and local distribution/regression checks do not prove that a live model follows the new route or that it saves Tokens/time. No model trial or forward test ran. Developer self-review is not Independent QA. No release or merge is authorized by this report.

Next responsibility: Quality Evaluator reviews the candidate and evidence, then Standard evaluation and distinct-Identity Independent QA. Review escalation ambiguity, parent ownership, native read-only limitations, preservation of formal gates, upgrade boundaries and integration with the inherited Lean work. Do not rerun unrelated comparisons or change sealed protocols as part of this handoff.
