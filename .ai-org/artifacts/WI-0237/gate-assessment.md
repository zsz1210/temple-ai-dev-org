# WI-0237 organizational acceptance assessment

Release Manager: Mog (`agent-mog`), Principal `human`, 2026-09-07 UTC.
Behavioral candidate: `e88f3274645b497b08d1a359e7617247791a25c4`.

Decision: **go for the bounded instrument repair and input audit only**. This is
separate from the retained **no-go for a new live efficiency comparison**.

- [Approved scope](design.md) permits an offline-qualified repair and a justified
  no-go when no new efficiency treatment has been identified. Both are delivered.
- [Developer full verification](verification-r1.md) passed 763/763 on Node.js
  24.20.0. Git comparison confirms that the delivered source, tests, instructions,
  dependencies and authority configuration match that candidate. Evidence-only
  follow-up does not create a new behavioral candidate or claim a new full run.
- [Test/Eval](review-r1.md) and [formal Independent QA](independent-qa.md) pass the
  same candidate. Developer Rikku and QA Lulu are different Agent Identities.
  Fresh QA adds 41 focused tests, 11 negative controls and 9 synthetic observation
  checks; evidence reuse and its limits are explicit. No unresolved acceptance
  defect was reported. The original failed review remains unchanged.
- Scope is reversible repository-only work, Standard risk, no UI, integration
  activation, package/version change, deployment, sensitive-data change or new
  model generation. The user authorized continuing the named stage. No separate
  human approval trigger applies to this local organizational acceptance; use
  `not-required` only for this closeout, not for merge, publishing or new spending.
- Remote PR #79 remains stacked on #78. Its verified base is `f61f755d`, and no
  concurrent source change was found. Maintainer integration remains separate;
  this assessment does not merge, rebase or approve the ancestor PRs.

Rollback is planned, not executed: before integration, withdraw PR #79; after an
authorized integration, prepare and review a normal revert of its implementation
commits (`3cb439c5`, then corrective `e88f3274`, in reverse dependency order),
reconcile any later source changes, and re-run full verification. Preserve this
audit/review history and the frozen WI-0234/WI-0236 data. Do not reset history or
resume a retired protocol. No rollback of production is involved.

The CLI release record is the canonical result of applying this assessment.
Local final checks and CI still validate the subsequent evidence-only commit.
No publication, external release or measured efficiency benefit is claimed.
