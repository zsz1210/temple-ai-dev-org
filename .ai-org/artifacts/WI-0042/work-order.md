# Work order — WI-0042

## Problem

The private Dashboard is currently reachable away from home through Tailscale, but a device on the owner's home Wi-Fi must still enable the VPN before it can observe the Mac Mini. Binding the full control plane to the LAN would expose the Human Inbox, Agent Commands, and per-process mutation authority to another network surface.

## Authorized slice

- Add an explicit home-LAN read-only listener bound to one configured RFC1918 IPv4 address.
- Reuse the existing redacted private snapshot and refresh-only event behavior.
- Keep the full control plane on `127.0.0.1` and keep the current tailnet-only Tailscale viewer available at the same time.
- Reject wildcard, loopback, link-local, multicast, and public LAN listener addresses.
- Add automated, runtime, socket-binding, and responsive-browser evidence.
- Document the home Wi-Fi and away-from-home operating paths.

No remote Agent Commands, Inbox access, public Internet exposure, login-time service, router mutation, Tailscale policy mutation, release, publication, or open-source preparation is authorized.

## Stop condition

Stop after the private LAN listener is independently verified, the two private viewing paths are available, and the first evidence-backed Dashboard review inventory is ready for discussion. Do not implement review findings without a separate approved slice.
