# Measurement closeout and actionable task navigation

The maintainer's continuation authorizes the two improvements recommended after
the separate-account rehearsal: mechanical evidence collection and actionable
responsibility guidance. This Standard item starts from main cec7b1f1. The
unreleased collaboration-recovery branch has a conflicting historical WI-0247;
retain it separately rather than overwrite canonical history. No publication,
main integration, paid model experiment or account changes are included.

## Design and acceptance

1. Reuse the existing measurement engine. Add a read-only `measurement report`
   operation using the same plan fingerprint and integrity checks. Produce a
   machine report and a Markdown evidence body for the requested existing Work
   Item and exact full Git revision. Distinguish successful compatible results,
   failed attempts, unavailable results and reuse from a new execution. Retain
   failures; unknown tokens and cost remain null. Do not parse arbitrary console
   text as test counts or fabricate acceptance. Hashes prove integrity, not trust.
2. Optionally persist only the generated Markdown in the Work Item's own artifact
   directory, with exclusive creation, path/symlink checks and no lifecycle write.
   Bind applicability only when every fingerprint file matches the candidate's
   Git bytes/mode and the current fingerprint matches; undeclared dependencies
   remain the plan author's responsibility. Reports never satisfy QA by themselves.
3. Contributor readiness preserves membership eligibility but exposes task scope,
   current owner, recorded/planned assignment, active claim and task blockers.
   Planned-owner mismatch, wrong Position and terminal items cannot say start.
   Existing actor selection and mutation guards remain authoritative. Name the
   responsible actor and a safe recovery step without impersonation instructions.
4. Unknown context route IDs are invalid input detected before canonical writes;
   state that `--context-ref` takes a route ID, not a file path.

## Verification and stop

Use focused tests for failed/missing/stale measurements, candidate mismatch,
same-input reuse, report output safety, owner/claim/planned identity distinctions,
and no-write route errors. Run one complete `npm run verify` on the final candidate
and Doctor after state changes. Measure report generation and unchanged reuse in
an isolated offline fixture, preserving actual durations and null billing fields.
Distinct QA reviews the exact candidate; do not treat generated prose as judgment.
The endpoint is a locally qualified candidate and evidence, not a framework release.
Rollback is a reviewed source revert; preserve old measurement attempts and claims.

Package review: the implementation introduces exactly `src/measurement-report.mjs`
and ADR-0069 as distributable files. Mechanical child WI-0251 owns
`scripts/check-package.mjs` and changes only the reviewed file ceiling from 446 to
448. Existing roots, file exclusions and the 8 MiB unpacked limit remain in force.
