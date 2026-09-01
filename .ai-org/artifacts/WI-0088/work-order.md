# Work Order — WI-0088

## Outcome

Add a reproducible real-browser regression gate for the human-facing Management Console so a green unit suite cannot miss responsive overlap, clipping, navigation, or runtime JavaScript failures.

## Boundaries

- Test the live loopback Control Plane against repository-backed data.
- Cover mobile, tablet, desktop, and 3440 px ultrawide viewports.
- Use a pinned development-only browser automation library and installed Google Chrome; do not vendor or download a browser binary.
- Keep the browser gate inside the existing Node.js 24 full CI job. Do not add another hosted job or run it for documentation/evidence-only changes.
- Preserve the current read-only/private-viewer authority boundary and do not add remote commands.
- UI delivery mode is `not-applicable`: this Work Item adds verification infrastructure and does not redesign the interface.

## Evidence required

- Dependency version, provenance, license, and non-runtime boundary.
- Contract tests for the script and CI gate.
- A local real-browser pass with actionable viewport results.
- An exact-revision full suite, schema validation, Doctor, and Independent QA by Lulu, distinct from Developer Rikku.

## Overlap

`WI-0086` is blocked on human/public-release gates and has no active claim. Its earlier public Alpha candidate becomes stale when this Work Item changes the lockfile. Any future publication must create and verify a new candidate after WI-0088; no release action is authorized here.
