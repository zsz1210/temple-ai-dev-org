# Risk Review — WI-0092

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| Temple silently installs a background process | Unexpected resource or privacy impact | Init and upgrade remain unchanged; apply and activation require explicit commands and exact plan digest. |
| Machine-specific addresses enter Git | Another user receives invalid or private configuration | Manifest and plist are clone-local and outside canonical project state. |
| Shell interpolation executes an unsafe path | Local command execution risk | LaunchAgent uses a direct executable plus XML-escaped argument array; no shell command string. |
| Stale plan applies different behavior | Wrong project, executable, or listener is installed | Recompute and compare an exact digest immediately before apply. |
| Replacement destroys a working service | Local visibility loss | Require `--confirm-replace`; retain previous files and restore them if activation fails. |
| Remove targets another service | Destructive local action | Derive and validate an exact project-scoped label and paths; require installed digest plus `--confirm-delete`. |
| Managed service implies every task is measured | Misleading analysis | Gap status uses correlated observations, not service state; copy says running is not full coverage. |
| Historic unobserved work floods current alerts | Unusable warning count | Separate all-time coverage from Work Items completed after the declared observation boundary. |
| Account activity is assigned to a Work Item | False attribution | Account values remain discarded and unallocated. |
| LAN viewer gains control authority | Remote mutation risk | Preserve GET-only private listener and exclude service paths and local control actions from snapshots. |
| LaunchAgent cannot resolve Codex | Repeated restart loop | Plan pins an existing absolute Codex executable and bounds KeepAlive; status exposes degraded Provider state. |
| Unsupported platform receives partial installation | Broken or misleading state | Plan reports unsupported before writing; apply fails closed. |

## Decision

Proceed sequentially in the isolated worktree. Install and activate the service on the primary clone only after the candidate is integrated there and the exact local plan is reviewed. The first runtime activation is local and reversible; it is not a public release or a model-generation request.

