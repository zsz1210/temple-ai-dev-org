# Rollback plan — WI-0130

WI-0130 changed only repository-local experiment tooling, tests, documentation, and canonical organizational records. It performed no deployment, publication, external write, automatic routing change, or production release.

If the retained experiment implementation must be removed, revert the WI-0130 commits on `codex/wi-0130-effectiveness-pilot` and rerun `npm run verify`. Preserve the local frozen lab until the revert decision and evidence audit are complete; then remove it only under a separately authorized cleanup action.
