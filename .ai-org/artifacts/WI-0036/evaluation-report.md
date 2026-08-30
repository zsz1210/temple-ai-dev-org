# Evaluation report — WI-0036

- Developer candidate revision: `f68186ba2c5ae20657847cbc651b3969b986db90`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Decision: **pass to Independent QA**

## Acceptance evaluation

1. **Real private access:** passed. The account owner opened the HTTPS Dashboard from a tablet on the same tailnet while the application listener remained loopback-only.
2. **Read-only and redacted boundary:** passed. Private snapshot and cursor-only refresh remained available; Inbox data, Agent Command controls, session secrets, raw events, and mutation routes were unavailable.
3. **Responsive state:** passed. A headed 420 by 900 pixel inspection retained readable current-state cards without visible horizontal overflow or browser console errors.
4. **Optional integration safety:** passed. Tailscale Serve was explicitly enabled, tailnet-only, version-observed at 1.98.8, documented with a stop path, and did not enable Funnel or public binding.

## Counterexample result

Quality challenged the boundary with a mutation request, direct checks for omitted private fields and controls, cursor-stream inspection, exact affected-path comparison, and a narrow viewport. No blocking counterexample was found.

## Evaluation boundary

Evidence `EVID-20260830T154016Z-86813807` covers one real tailnet, the account owner's tablet confirmation, the live macOS host, and an independent 420-pixel browser inspection. It does not prove unattended startup, Internet availability, write access, multiple tailnets, every browser, or production service-level availability. Independent QA must still reproduce the exact candidate before Release Gate.
