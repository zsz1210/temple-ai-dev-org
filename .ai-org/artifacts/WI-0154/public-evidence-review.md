# WI-0154 Public Evidence Review

## Outcome

The current repository and package contain no publication-blocking finding under the `public` Evidence Profile. The package surface is clean. The repository remains `review-required` because it deliberately retains historical environment evidence and binary visual evidence.

`review-required` does not mean that 402 vulnerabilities were found. It means that 402 occurrences need an explicit maintainer disposition before the repository is made public.

## Reviewed revision

- Revision: `053013348225d6a0e81e592ad92ac13804428aa9`
- Profile: `public`
- Publication, release, npm publication, hosting mutation, and Git-history rewrite: not performed

## Audit reconciliation

| Surface | Result | Detail |
| --- | --- | --- |
| Repository | Review required; no blockers | 3,577 tracked files: 3,509 text and 68 binary |
| npm package | Clean | 370 package files; no blocker or review finding |

The 402 repository occurrences reconcile as follows:

| Rule | Occurrences | Files | Interpretation |
| --- | ---: | ---: | --- |
| Maintainer home path | 279 | 84 | Retained lifecycle records, implementation evidence, and one audit fixture |
| Private IPv4 address | 49 | 26 | Mostly retained self-host evidence plus deliberate fixtures |
| Private tailnet hostname | 6 | 4 | Retained remote-access evidence plus a deliberate fixture |
| Binary review | 68 | 68 | PNG screenshots and visualization evidence |
| **Total** | **402** | — | Exact machine-audit total |

The redacted path-level manifest is in `publication-audit-summary.json`. It records rule IDs, repository-relative paths, and counts only; it does not reproduce matched values.

## Binary evidence review

All 68 PNG files were opened through eight contact sheets. Higher-risk command, configuration, and architecture images were also opened at original resolution.

- 21 PNGs are retained Work Item artifacts.
- 47 PNGs are retained Playwright outputs.
- No rendered credential, private key, personal email, terminal session, browser address bar, or private endpoint was observed.
- No PNG contains a `tEXt`, `iTXt`, `zTXt`, or `eXIf` metadata chunk.
- A byte-string scan produced two email-shaped candidates. Original-resolution review found no visible email; with no PNG text metadata, these are treated as compressed-byte false positives.

The images visibly contain Temple work-item IDs, Agent display names, model/routing settings, and synthetic command fixtures. Those are framework evidence, not secrets, and are consistent with the accepted self-host Evidence Profile.

## What the result means

### Current tree

The distributable npm package is already separated from retained development evidence. Public-profile blocking rules find no secret-shaped value in the current tracked tree. Existing home paths and private-network identifiers are baseline review items rather than newly introduced blockers.

### Git history

Making this repository public would expose the retained Git history as well as the current tree. Because this review does not rewrite history, legacy local paths and private-network evidence remain recoverable from history even if future files are normalized.

### Future changes

The publication audit should remain a release and visibility-change gate. New values matching blocking rules must fail; baseline retained evidence must not silently grow. Binary additions must continue to require an explicit review disposition.

## Recommended disposition

1. Keep the accepted self-host development evidence and its history intact; do not rewrite canonical records merely to make the review count reach zero.
2. Treat the 402 occurrences as the documented public baseline, not as permission for new occurrences.
3. Keep the npm package gate strict and clean.
4. Re-run the public Evidence Profile against the exact candidate revision immediately before any future visibility change.
5. Require the Human Principal to make the final visibility decision after reviewing this report; this Work Item does not authorize publication.

## Residual human decision

The remaining decision is narrow: whether the maintainer accepts public visibility of the retained historical local-path and private-network evidence. No technical cleanup can remove that historical exposure without a separate, explicitly approved history-rewrite plan.
