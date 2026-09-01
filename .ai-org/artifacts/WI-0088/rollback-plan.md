# WI-0088 Rollback Plan

If the browser gate causes unacceptable CI instability or breaks supported development environments before later dependent changes are added:

1. Create a dedicated rollback Work Item from the current repository revision.
2. Revert implementation commit `1a82106c9fdc61efaa3aa502be320432c0bf82bf` without rewriting history.
3. Run `npm ci --ignore-scripts`, `npm run verify`, schema validation, and Doctor on Node.js 22 and 24.
4. Confirm `.github/workflows/ci.yml` has one valid aggregated job and `package-lock.json` no longer resolves `playwright-core`.
5. Preserve this Work Item's evidence and record why the semantic browser gate was withdrawn.

Do not delete failure evidence, force-push, or restore the stale Alpha.29 candidate. A later public candidate must always be cut from the then-current exact revision.

