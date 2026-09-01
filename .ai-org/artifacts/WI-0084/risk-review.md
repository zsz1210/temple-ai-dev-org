# Risk Review — WI-0084

## Disposition

Proceed with documentation and canonical-state reconciliation. Do not treat the resulting roadmap as release approval and do not perform a license migration inside this Work Item.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| “Final stage” is understood as product completion | Users infer production readiness | Always qualify it as the final stage before the first public Alpha and retain later qualification explicitly. |
| Old passing tests are used for a new release | Untested candidate is published | Require every blocking check at one exact final candidate revision. |
| Cleanup hides failed experiments | The project loses learning and overstates readiness | Retain blocked Provider and multi-repository items with their NO-GO evidence. |
| Lifecycle correction closes work without evidence | Canonical state becomes cosmetic | Inspect exact revisions and named artifacts; use normal Temple gates and CLI validation. |
| Three language editions drift | Readers receive different promises | Keep identical hierarchy and factual checkpoints, then review each edition as native prose. |
| npm publishes repository self-host data | Private evidence or unnecessary files are redistributed | Treat an explicit package allowlist and reviewed dry-run manifest as an Alpha blocker. |
| Broad runtime declaration promises unsupported Node versions | Installation failures and an inaccurate support contract | Test maintained LTS lines and narrow `engines` before release. |
| MIT recommendation is mistaken for a permanent or legal conclusion | Patent or contribution needs are missed | Keep the decision with the Human Principal and define explicit triggers to reconsider Apache-2.0. |
| License is changed piecemeal | Conflicting package, ADR, notices, or copied templates | If approved later, perform one dedicated migration across every redistributed surface. |
| Release-hardening findings expand silently into public actions | Visibility, tags, settings, or packages change without authority | Record blockers only; require separate authorization for license, publication, release, or external settings. |

## Rollback

Revert the candidate commit and rebuild generated views. Preserve the raw audit results and blocked validation records. No external rollback is required because public settings and distribution remain unchanged.
