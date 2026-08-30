# Product specification — WI-0042

## User outcome

At home, the project owner can open the Temple Dashboard from a tablet on the same Wi-Fi without enabling Tailscale. Away from home, the existing tailnet-only HTTPS address remains available.

## Operating modes

| Location | Entry point | Authority |
| --- | --- | --- |
| Mac Mini | Loopback Dashboard | Full local Dashboard and explicitly enabled local commands |
| Home Wi-Fi | Dedicated LAN listener | Redacted, read-only Dashboard |
| Away from home | Tailscale Serve | Redacted, read-only Dashboard |

The home-LAN listener is opt-in. The operator supplies one exact RFC1918 IPv4 address. Temple must reject wildcard, loopback, link-local, multicast, unspecified, and public addresses. The default LAN viewer port is `41741`; an operator may choose another available port.

## Private-viewer contract

The LAN and Tailscale viewers share one authority contract:

- no Human Inbox or Agent Command UI;
- no per-process session secret;
- no mutation request;
- no daemon filesystem metadata or raw recent events;
- refresh-only SSE followed by a newly redacted snapshot;
- current Usage & models data may appear only through that redacted snapshot.

The dedicated LAN listener derives viewer authority from the exact socket it owns. It must not trust a caller-supplied Host or identity header to upgrade authority.

## Scope boundaries

This slice does not create authentication for an untrusted LAN, TLS for home Wi-Fi, router configuration, automatic LAN discovery, a login-time service, remote commands, public Internet access, release activity, publication, or open-source preparation. A changed DHCP address requires restarting the listener with the new private address unless the operator reserves the Mac Mini address in the router.

## Acceptance evidence

- Unit evidence rejects every unsupported address class and accepts all RFC1918 ranges.
- HTTP evidence reads the LAN page and redacted snapshot while rejecting Inbox and mutation access.
- Runtime evidence shows the process listening on the exact Mac Mini address rather than a wildcard.
- Tailscale status remains tailnet-only and its viewer still loads.
- A real browser at desktop and tablet width renders the LAN viewer without command controls, console errors, or horizontal page overflow.

