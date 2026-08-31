# WI-0050 current nonterminal-ledger review

- Snapshot basis: repository state after creating `WI-0050`
- Review action: classification only
- Lifecycle mutations: none

## Summary

The repository has 50 Work Items: 28 `done`, one `cancelled`, and 21 nonterminal. The nonterminal set is not one undifferentiated backlog.

| Classification | Count | Meaning |
|---|---:|---|
| Release-held | 15 | Implementation and review reached `release_gate`; the user has intentionally deferred a formal release decision. |
| Retained validation | 2 | A real environment boundary remains intentionally untested. |
| Decision-blocked | 1 | Build should not start until the human owner chooses the trust model. |
| Planning parent | 2 | Umbrella or review scope remains open while child outcomes and later decisions are reconciled. |
| Active planning | 1 | This Work Item designs the next validation stage and must stop before execution. |

## Recommended action for every nonterminal Work Item

### Retained validation

| Work Item | Current state | Recommendation |
|---|---|---|
| `WI-0029` — Prototype local Agent Command Gateway | `test` | Keep. The stale privacy defect was resolved by `WI-0030`; the remaining boundary is a separately authorized command sent to a safe disposable registered Codex task. Do not treat deterministic fixtures as real execution. |
| `WI-0035` — Reduce CI cost without hiding behavioral results | `test` | Keep. Local scope and timing tests are not hosted GitHub Actions timing or billing evidence. Run a bounded hosted comparison only after explicit cost and GitHub authorization. |

### Release-held

| Work Item | Current state | Recommendation |
|---|---|---|
| `WI-0030` — Prevent complete command retention | `release_gate` | Keep release-held. Its implementation and privacy correction remain valid; the separate real-command boundary belongs to `WI-0029`. |
| `WI-0032` — Sandbox federation participant Git inspection | `release_gate` | Keep release-held until the consolidated hardening release review. |
| `WI-0034` — Make Dashboard current-state interaction trustworthy | `release_gate` | Keep release-held until the consolidated hardening release review. |
| `WI-0036` — Add a private read-only Dashboard viewer | `release_gate` | Keep release-held; do not convert private-viewer evidence into a publication or deployment claim. |
| `WI-0037` — Make private Dashboard shutdown cleanup signal-safe | `release_gate` | Keep release-held until the consolidated hardening release review. |
| `WI-0038` — Reject invalid lifecycle gate evidence references | `release_gate` | Keep release-held until the consolidated hardening release review. |
| `WI-0040` — Expose truthful usage and model observability in the Dashboard | `release_gate` | Keep release-held. The interface is implemented, but the usage baseline is still unqualified. |
| `WI-0041` — Coalesce Dashboard refreshes after SSE replay | `release_gate` | Keep release-held until the consolidated hardening release review. |
| `WI-0042` — Add a private home-LAN read-only Dashboard viewer | `release_gate` | Keep release-held; local availability is not authorization for public exposure. |
| `WI-0044` — Redesign Dashboard navigation and operator information architecture | `release_gate` | Keep release-held as the first implemented child of the Dashboard review parent. |
| `WI-0045` — Prioritize firing recovery conditions on Dashboard Now | `release_gate` | Keep release-held until the Dashboard child series is reconciled. |
| `WI-0046` — Reframe Control Plane as management console and add Organization | `release_gate` | Keep release-held until the Dashboard child series is reconciled. |
| `WI-0047` — Make Temple Workspace human-first and fluid across screen sizes | `release_gate` | Keep release-held until the Dashboard child series is reconciled. |
| `WI-0048` — Adopt dark engineering style and visualize Temple structure | `release_gate` | Keep release-held until the Dashboard child series is reconciled. |
| `WI-0049` — Make Temple Workspace status language human-readable | `release_gate` | Keep release-held. This is the latest verified presentation slice, not authorization for another visual redesign. |

### Decision-blocked

| Work Item | Current state | Recommendation |
|---|---|---|
| `WI-0033` — Establish operator-owned provider trust | `spec` | Defer Build. The human owner must choose how approved origins, credential handles, executable paths, and argument pinning live outside repository control. This decision is not required for the local planning slice in `WI-0050`. |

### Planning parents

| Work Item | Current state | Recommendation |
|---|---|---|
| `WI-0031` — Harden Temple before the next release | `spec` | Keep as the hardening umbrella. Reconcile it only after its release-held children, `WI-0033`, and `WI-0035` receive their respective decisions or retained-gap disposition. |
| `WI-0043` — Review Dashboard information architecture and operator usability | `spec` | Keep until its implemented child chain (`WI-0044` through `WI-0049`) receives a consolidated outcome. Do not advance the parent merely because the children reached release gate. |

### Active planning

| Work Item | Current state | Recommendation |
|---|---|---|
| `WI-0050` — Design Temple effectiveness and multi-repository validation | `intake` | Complete and independently review the plan, then stop at a human execution decision. Create no experiment repository or task in this slice. |

## Reconciliation order after this plan

1. Obtain a human decision on the `WI-0050` experiment plan.
2. If approved, create a new execution parent and bounded child Work Items; do not expand `WI-0050` into implementation.
3. Keep the 15 release-held items untouched until the user explicitly starts a consolidated release review.
4. Schedule `WI-0029` and `WI-0035` as separate real-environment validations because they require different permissions and risks.
5. Resolve `WI-0033` only through a product trust-model decision.
6. Reconcile `WI-0031` and `WI-0043` after their children and retained gaps have explicit dispositions.

