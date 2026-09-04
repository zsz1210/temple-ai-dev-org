# Independent QA report — WI-0042

- Candidate revision: `5b622e242f71d8d45e606d23e34e511697aa8686`
- Independent QA: Lulu (`agent-lulu`)
- Developer: Rikku (`agent-rikku`)
- Decision: pass

## Independent reproduction

Independent QA created another fresh detached worktree at the exact candidate revision and ran the five private-viewer tests without relying on Developer or Quality command output. All five passed with 0 failed and 0 skipped. The disposable worktree was removed after the run.

QA then independently inspected the live candidate process:

- the LAN snapshot reported `private-lan`, read-only, and mutations unavailable;
- Inbox, daemon metadata, and recent raw events were absent;
- LAN Inbox returned `403` and Agent Command POST returned `405`;
- the process listened only on exact `127.0.0.1:56635` and `<PRIVATE_IPV4>:41741` sockets;
- Tailscale Funnel status reported the HTTPS endpoint as `tailnet only`, proxying only to the loopback port.

The separate Quality exact-candidate run passed repository checks, documentation links, and all 221 automated tests. A fresh Quality browser session also reproduced the private read-only label, current live stream, absence of Inbox and Agent Command headings, no horizontal overflow, and 0 console errors or warnings at 420 × 900.

## Separation and boundary

Rikku is the Developer and Lulu is Independent QA, preserving the required Agent Identity separation. This pass establishes readiness for the bounded organizational release gate only. It does not authorize a package release, push, public access, publication, open-source preparation, router or firewall change, login-time startup, remote Agent Commands, or a Dashboard redesign.

Physical tablet reachability remains the owner's final same-Wi-Fi confirmation. Failure of that check should reopen runtime diagnosis without weakening the listener boundary.
