# WI-0126 technical design

## Change shape

Replace the release-first narrative in the three roadmap files with a stable outcome hierarchy:

```text
Vision
  -> Evidence-backed current position
  -> Now: dependable core operating path
  -> Next: qualified real adoption and comparison
  -> Later: optional execution, enterprise qualification, public distribution
```

The roadmap will not duplicate individual Work Items. It will link to:

- `../validation/README.md` for the evidence catalogue;
- `release-readiness.md` for the paused distribution checklist;
- `../../CHANGELOG.md` for version history; and
- repository-owned Work Items for delivery detail.

## Current-state projection

Use canonical Work Item documents rather than the previous prose snapshot:

- current non-terminal core decision: `WI-0033` at `spec`;
- paused release program: `WI-0086` at `blocked`;
- comparison outcomes: Wave 5A mechanism complete but unqualified, `WI-0117` concluded `inconclusive`;
- route foundation: `WI-0119` through `WI-0125` accepted or done;
- managed Usage performance: `WI-0094` done.

## Verification design

- compare headings and local links across all three languages;
- reject obsolete claims that `WI-0064`, `WI-0067`, or `WI-0094` remain active;
- require explicit wording that cross-comparison is incomplete;
- require explicit wording that Console and Usage observation are optional;
- run documentation-focused tests, schema validation, Doctor, and `npm run verify`.

No generated status view is edited directly.
