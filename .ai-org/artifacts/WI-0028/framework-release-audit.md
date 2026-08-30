# Framework release audit — WI-0028

- Audited revision: `ee0e65b3bac156fdf2a18a6281dd81af3f644ee5`
- Reviewer role: parallel read-only framework and documentation review
- Private-checkpoint verdict: **GO after one documentation correction**
- Public/npm verdict: **NO-GO without a separate hardening review**

## Private checkpoint finding

The repository version, private package boundary, release documentation, CI entry point, license, and provenance are sufficient to continue toward a private Git tag after exact-revision CI and clean-clone verification.

The review found one contradiction: `docs/concepts/vision.md` described all multi-repository operation as planned even though the release line ships bounded local, read-only federation and portfolio projections. The candidate corrects this by separating the shipped local projection from unverified remote, multi-machine operational coordination.

## Public and npm findings

- `package.json` remains `private: true` and this checkpoint does not publish it.
- The package has no `files` allowlist or `.npmignore`; the preflight dry run relied on `.gitignore` and included 673 paths, including 352 under `.ai-org` and 10 under `.codex`. Those project-state paths require a privacy and package-surface decision before publication.
- `SECURITY.md` does not yet define supported versions or a private disclosure channel.
- Node.js 20 is locally verified and CI uses Node.js 22, but no broader operating-system support matrix is claimed.
- Repository history and project-owned state require a separate privacy/provenance review before public visibility.

These findings do not expand the authorized private tag into a public or npm release.
