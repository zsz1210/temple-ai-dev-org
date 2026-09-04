# Quality test report — WI-0036

- Developer candidate revision: `f68186ba2c5ae20657847cbc651b3969b986db90`
- Integrated revision inspected: `2979279dc7a34f8bc806f3a2fe3b426bd010f14a`
- Quality identity: Lulu (`agent-lulu`)
- Position: Quality & Evaluation Engineer
- Verdict: **GO — pass to Eval**

## Live private-network result

The account owner enabled Tailscale Serve and confirmed that the Dashboard opened successfully from a tablet connected to the same tailnet at `https://<PRIVATE_TAILNET_HOST>`. The live Serve configuration was tailnet-only and proxied `/` to the loopback listener at `127.0.0.1:64172`; Funnel was not enabled.

A separate headed 420 by 900 pixel inspection confirmed that the private page rendered without a visible horizontal overflow, refreshed through cursor-only Server-Sent Events, exposed the redacted read-only snapshot, omitted Human Inbox and Agent Command controls, retained no raw event payload, and returned HTTP 405 for a mutation request.

## Revision and security boundary

A path-bounded comparison confirmed that every WI-0036 affected implementation, test, security, ADR, and operations-document path is byte-identical between the Developer candidate and the inspected integrated revision. The Control Plane listener remained bound to loopback. The private URL is a Tailscale Serve endpoint, not a public Funnel endpoint, and the Agent Command Gateway remains local-only.

This result proves the requested real-tailnet access path and the bounded 420-pixel tablet state reported by the account owner. It does not establish unattended startup, public Internet access, remote mutation authority, production availability, a second tailnet, or behavior on every tablet and browser combination.
