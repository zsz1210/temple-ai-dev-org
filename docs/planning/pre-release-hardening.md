# Pre-release hardening review

- Review baseline: `6bb7e17e465b1fb94be7cbe63f6dfe4ec5aa00cd`
- Program Work Item: `WI-0031`
- Release status: **NO-GO for current `main`**

The integrated pre-release review covered Dashboard interaction and observability, multi-repository federation, provider trust, local and GitHub CI cost, and evidence required for comparative framework claims.

## Immediate corrective program

| Work Item | Boundary | Disposition |
|---|---|---|
| `WI-0032` | Federation must not execute participant-controlled Git configuration, inherit ambient secrets, discover a parent repository from a nested path, or lazy-fetch missing objects | Implement and verify before release |
| `WI-0033` | Provider credentials, approved origins, and executable selection must be operator-owned rather than repository-activated | Hold implementation until the operator trust contract is approved |
| `WI-0034` | Live refresh must preserve a command draft and Dashboard current/attention/timeline data must be truthful | Implement and visually verify before claiming the command surface ready |
| `WI-0035` | Governance and behavioral CI signals must remain distinct while a strict evidence-only lane avoids redundant full integration runs | Implement conservatively and compare measured scope behavior |

## Retained release boundaries

- `WI-0029` remains a visible Quality NO-GO until its exact correction is reconciled through the parent lifecycle.
- `WI-0030` remains at an unclosed Release Gate.
- Current local `main` is later than the immutable Alpha.27 release commit and must not reuse that version for another release.
- No public release, package publication, deployment, external write, real Codex command, or credential-bearing provider run is authorized by this program.

## Evidence baseline

The repository currently has 30 completed-or-active Work Items but zero correlated detailed Token observations. Policy fixtures prove fail-closed behavior, not time or Token savings. A future comparative experiment must use matched tasks, fixed model and reasoning settings, exact acceptance, and both quality and usage outcomes before Temple claims an efficiency percentage.
