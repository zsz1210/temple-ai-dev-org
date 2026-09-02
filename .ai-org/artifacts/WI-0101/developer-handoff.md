# WI-0101 Developer handoff

## Candidate

- Revision: `3c94b998d01ff0a9daf03cb99998721f218ee846`
- Branch: `codex/wi-0100-optional-console-collector`
- UI delivery mode: `code-first`

## Completed

- Added a distinct `management-read-only` presentation mode.
- Labelled loopback access `Local · Read only` while preserving the existing private-network label.
- Removed Human Inbox and Agent Command destinations from the read-only DOM and keyboard order.
- Preserved the existing responsive shell and dark engineering visual hierarchy.
- Updated managed-local regression coverage for the Collector-only LaunchAgent argument vector.

## Verification

- Live Chrome review passed at `1200x768` and `390x844` with zero horizontal overflow, console errors, or warnings.
- The full browser gate passed at `390x844`, `768x1024`, `1440x1000`, and `3440x1440` across six primary views plus reduced-motion checks.
- The live Console process reported no Usage collection and no writer lease; deterministic HTTP tests reject non-GET routes and exclude local mutation surfaces.

## Retained limits

- The measured idle RSS and CPU values are one Mac Mini sample, not a cross-platform guarantee.
- No visual redesign or remote command capability is included.
