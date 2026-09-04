# WI-0166 Release Manager Preflight

- Release Manager: Mog (`agent-mog`)
- Exact qualified revision: `149076c69d7ecc2af3ede76e1f3b8d7a88285334`
- Owner approval: [owner-approval.md](owner-approval.md)
- Independent QA: pass
- External-action decision: **ready after this gate is merged to protected `main`**

The permitted action is limited to changing `zsz1210/temple-ai-dev-org` visibility to public and running the post-change verification in the Work Order. A tag, GitHub Release, npm publication, deployment, and announcement remain unauthorized.

The Work Item stays in `release_gate` until the external state is observed. If the post-change verification fails, restore private visibility and close with a no-go result rather than continuing to another release surface.
