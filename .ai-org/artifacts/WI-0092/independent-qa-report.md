# Independent QA Report — WI-0092

## Candidate lineage and independence

- Developer: Rikku (`agent-rikku`)
- Independent QA: Lulu (`agent-lulu`)
- Source candidate: `5e74864527cb2422aac67804efda3583194e6a58`
- Integration merge: `27b6d666917161c2226321ae5b79a943a6db71c9`
- Corrected exact candidate: `ad88803703fb8dc311229b3f10d7aed751837f2b`
- Fresh environment: detached Git worktree, Node.js `v24.20.0`, `npm ci --ignore-scripts`, Chrome 152.0.7977.65

## Verification

| Check | Result |
| --- | --- |
| Repository, docs, and package boundary | Pass; 309 packaged files |
| Complete test suite | 276 passed, 0 failed |
| Four responsive viewports, six views each | Pass |
| Reduced motion | Pass |
| Fresh worktree after verification | Clean |
| Managed-local LaunchAgent | Running after restart |
| Private LAN mutation | HTTP 405 |
| Private LAN local-path scan | Pass after corrective WI-0093 |
| Loopback diagnostic state directory | Retained |

## Adversarial finding and correction

The first real LAN rehearsal found a privacy defect that contract-level QA had missed: the private Usage object retained `usage.source.state_directory`. Release approval was withheld. WI-0093 moved redaction to the shared private-viewer boundary, added home-LAN, Tailscale, and loopback regression assertions, then passed separate Developer, Quality, Independent QA, and Release Gate review at `ad888037`.

This correction demonstrates the purpose of the live gate; the original source candidate alone is not the final accepted runtime boundary.

## Acceptance assessment

- Off remains optional and missing usage remains unknown, not zero.
- On-demand and Managed local modes remain distinguishable.
- Installation is clone-local, explicit, reversible, macOS-only, and not performed by `init` or `upgrade`.
- Retained observations survive provider shutdown without implying that earlier work can be reconstructed.
- Post-start gaps remain explicit; account-wide data is not allocated to Work Items.
- Private viewing is GET-only and corrected not to expose reviewed local runtime paths.
- The 38.293503-second, approximately 1.864 MB snapshot is a real non-blocking performance limitation. No low-latency or production-scale claim is allowed.

## Decision

`pass`

WI-0092 may advance to Release Gate for organizational closeout at the corrected exact candidate. The service remains active under the user's existing local-observation request. This report does not authorize public release, deployment, visibility changes, package publication, or automatic model routing.
