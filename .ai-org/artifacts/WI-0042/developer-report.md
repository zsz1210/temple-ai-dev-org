# Developer report — WI-0042

- Candidate revision: `5b622e242f71d8d45e606d23e34e511697aa8686`
- Developer: Rikku (`agent-rikku`)
- Decision: ready for Test

## Change

Temple now supports an optional home-LAN read-only listener through `--lan-viewer-host`, with port `41741` by default and an optional `--lan-viewer-port`. The listener accepts only an exact RFC1918 IPv4 address and reuses the private snapshot, refresh-only SSE, GET-only routes, and Inbox exclusion. The full control plane remains on loopback and the pinned Tailscale viewer can run concurrently.

The LAN listener assigns read-only authority from the socket that accepted the request. Tests prove that forged localhost Host and Tailscale identity headers cannot upgrade it. Shutdown closes both HTTP servers; Tailscale cleanup remains owned by the existing signal-safe adapter.

## Verification

- Focused private-viewer tests: 5/5 pass.
- Full repository verification: 221/221 pass, with repository and documentation checks passing.
- Live socket inspection: `127.0.0.1:56635` and exact `<PRIVATE_IPV4>:41741`; no wildcard listener.
- Live LAN snapshot: `private-lan`, read-only, mutations unavailable, and no Inbox, daemon metadata, or recent raw events.
- LAN Inbox request: `403`; LAN Agent Command POST: `405`.
- Tailscale page: HTTP `200`; Serve and Funnel status both report `tailnet only` and proxy only to `127.0.0.1:56635`.
- Fresh Chromium through `http://<PRIVATE_IPV4>:41741` reached `Snapshot current` at 1440 × 1000 and 420 × 900, with 0 console errors, 0 warnings, no horizontal overflow, and no Inbox or Agent Command surfaces.

Transient screenshot digests:

- Desktop 1440 × 1000: `sha256:c7a5864eb8fbe35771864a388b7cba5d0343d7bbce62c6bfd81cdbd94a05b3a5`
- Narrow 420 × 900: `sha256:cd2ffa69529b4d1353f8c23b92af04f12cf9362cc16567b9b33804bfec3bfea5`

The screenshots were deleted after digest capture because they contain live operational state and are not repository authority. Physical tablet reachability still requires the owner to open the printed LAN URL from the same Wi-Fi; the browser validation used the Mac Mini's LAN route and a tablet-sized viewport.
