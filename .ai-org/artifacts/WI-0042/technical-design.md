# Technical design — WI-0042

## Listener topology

One control-plane process owns two HTTP servers and one optional proxy adapter:

```text
127.0.0.1:<dynamic>  ── full local request classifier and mutation gateway
        ▲
        └── Tailscale Serve ── exact *.ts.net host + Tailscale identity ── read only

192.168.x.x:41741   ── dedicated private-viewer request handler ── read only
```

The LAN socket is a capability boundary: every request accepted by that dedicated listener is classified as `private-viewer` with transport `private-lan`. Caller-supplied Host and identity headers cannot produce loopback authority. The original server continues to classify loopback and Tailscale requests exactly as before.

## Address validation

`normalizePrivateLanViewerHost` accepts only canonical IPv4 addresses inside `10.0.0.0/8`, `172.16.0.0/12`, or `192.168.0.0/16`. It rejects hostnames, IPv6, wildcard and unspecified addresses, loopback, link-local, carrier-grade NAT, multicast, documentation ranges, and public addresses. The listener does not auto-select an interface or bind `0.0.0.0`.

The CLI exposes:

```text
--lan-viewer-host <private-ip>
--lan-viewer-port <0..65535>
```

The host enables the listener. Its port defaults to `41741`; `0` remains available for tests or one-run diagnostics. A port without a host is rejected.

## Request and data boundaries

Both private transports use the existing read-only routes and private snapshot projection. The projection records `private-lan` or `tailscale-serve`, excludes Inbox, daemon metadata, and recent raw events, and declares mutations and raw events unavailable. Private SSE emits cursor-only refresh messages. Every non-GET request is rejected before body parsing, and `/api/v1/inbox` remains forbidden.

## Lifecycle and cleanup

The primary server starts before the LAN listener. A LAN bind failure closes the primary server and every provider before releasing the telemetry lease. Normal shutdown closes both listener sockets and all SSE clients before closing the journal. Tailscale Serve cleanup remains owned by the CLI adapter and executes even if server cleanup fails.

## Risk review

- **Authority confusion:** mitigated by passing access type from the owning listener instead of trusting a LAN header.
- **Accidental public exposure:** mitigated by exact RFC1918 validation and refusal of wildcard or hostname binds.
- **Household-network observation:** accepted for this explicit opt-in read-only mode; the view still contains project operational metadata. Use Tailscale instead on an untrusted network.
- **Plain HTTP on Wi-Fi:** bounded to read-only metadata on a trusted home network; no credential or mutation capability crosses the listener.
- **DHCP drift:** surfaced in documentation; restart with the new address or reserve the Mac Mini address in the router.
- **Port collision:** startup fails closed and reports the bind error; operators may choose another port.
- **Cleanup regression:** covered by automated close tests and live socket inspection.

No new dependency, external write, router change, Tailscale policy change, or release action is required.

