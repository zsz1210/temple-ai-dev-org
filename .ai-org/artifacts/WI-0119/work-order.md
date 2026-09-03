# Work order — WI-0119

Temple already separates Positions, Skills, Work Items, model observations, and matched evaluation, but it does not yet have one coherent boundary that decides how a concrete execution step should be performed. Previous validation runs exposed the cost of that gap: provider-incompatible requests, command-policy mismatches, reactive budget stops, and model comparisons whose task shapes were not fully controlled.

## Outcome

Deliver an **Adaptive Execution Routing** foundation that:

1. keeps organizational responsibility separate from execution selection;
2. resolves each execution step against explicit capability, privacy, provider, risk, and resource constraints;
3. explains every eligible, rejected, selected, fallback, or unresolved candidate;
4. supports project-owned capabilities and non-software work without adding a core Position; and
5. remains read-only and non-executing in this release.

## Delivery boundary

- Use deterministic project-owned rules. Do not infer a route from an Agent name or silently learn a route from unrelated historical work.
- Apply hard capability and policy filters before any preference or resource ordering.
- Preserve `pinned`, `shadow`, and `advisory` selection modes. `automatic` is invalid and no command may start a task or contact a Provider.
- Represent one Work Item as multiple independent execution steps.
- Treat absent resource measurements as unknown, never zero.
- Keep provider trust, credentials, executable selection, deployment, publication, and public release outside this Work Item.

## Stop condition

Stop after versioned contracts, a deterministic resolver, read-only CLI and Console projections, a non-software extension fixture, focused regressions, full repository verification, and revision-matched Independent QA are complete. Do not push, merge, publish, deploy, or enable automatic execution.
