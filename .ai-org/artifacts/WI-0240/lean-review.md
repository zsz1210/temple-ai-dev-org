# WI-0240 Lean verification

Lulu (`agent-lulu`, `quality_evaluator`) reviewed candidate
`f80651d68b75d72682448ac2bac3823b02bbd385`, distinct from Developer Rikku
(`agent-rikku`). Claim: `claim-20260907134648-7fdbe0a8`; worker:
`worker-20260907134648-197fbbc4`. Review date: 2026-09-07 UTC.

**Accept the bounded Lean scope.** No blocking candidate finding remains. This
review supports `test_evidence` and `lean_closeout` for the inventory, scoped
Learning, retrieval and offline design only. It is not formal Independent QA,
live efficacy evidence, or permission to launch, merge, publish or release.

## Fresh verification

All commands ran in the isolated WI-0240 worktree on Node.js 24.20.0. The required
full attempt ran once, after the focused checks, with no other concurrent test
suite dispatched by this review.

| Command | Actual result |
| --- | --- |
| `node --test .ai-org/artifacts/WI-0240/offline.test.mjs` | Exit 0; 6/6 passed; 570.732917 ms |
| `/usr/bin/time -p npm run verify` | Exit 0; repository, links and package checks passed; 767/767 tests passed; 193651.823584 ms test duration; 195.33 s wall time |
| `node ./templew.mjs doctor . --json` | Exit 0; 37 pass, 0 warn, 0 fail; healthy |

Full verification had zero failed, cancelled, skipped or TODO tests. The existing
recursive Node test-runner warning remained. The Developer's previous full
**766/767 failure** at `test/optional-console-collector.test.mjs:133` and later
isolated **8/8 pass** remain recorded in [verification](verification.md). This
fresh full pass neither erases that failure nor proves its cause or repair. No
Console source or timeout was changed; no repeated full attempt was made here.

## Acceptance evidence and limits

- The three public exports are byte-identical to the candidate's parent; their
  SHA-256 values, original seals and every indexed row match the inventory. The
  18 rows contain 13 attempts and five missing observations, with one of those
  attempts censored by incomplete final usage. Inventory `source_revision` values
  match the original exports' executable-source metadata; they do not identify
  commits containing the later public exports.
- Original strict-handoff rejects and the WI-0236 candidate rejection remain
  failures under their frozen contracts. The separately reported 46-case offline
  recheck does not rescore them. Censored cost is not completed-delivery cost;
  historical references are neither new independent samples nor causal controls.
- All five prior Learning index records compare unchanged against the parent.
  Only validated Lessons 0005/0006 and active Practice 0002 enter the eligible
  corpus. The actual Learning CLI passes both retrieval cases, an unrelated
  SwiftUI query returns no entries, and actual Work Item Context resolution
  retrieves the scoped Practice. Availability does not prove Agent compliance.
- The Practice is medium-confidence project guidance for quote/shipping
  experiment design. It cites the completed WI-0234 counterexample, preserves
  unknown-accounting and cleanup stops, and grants no global rule, model-policy
  or Skill promotion. The two proposed compact subjects remain unexecuted and
  require fresh scope, compatibility checks and authorization.
- Existing stop-decision code preserves shared validity/cleanup and unknown-usage
  boundaries. Offline cases do not implement or qualify budget-censor continuation.
  No framework, runner, frozen lab, historical result or execution-policy change
  appears in this candidate.

The Learning Markdown records retain creation-time `candidate` / `not yet`
headers followed by confirmed revalidation history. Read-only source inspection
confirmed this is the existing CLI's append behavior; the current index and
retrieval state are correct. This is a human-readability limitation, not a failed
activation claim. No broader source repair was made.

An initial review probe incorrectly treated executable `source_revision` as the
export's containing commit and failed because that later artifact did not yet
exist. Checking the original export metadata and parent-commit bytes resolved
that assumption without modifying any evidence.

Only this review file was written by the Verifier. The coordinator owns subsequent
worker cleanup, lifecycle and integration records, and must refresh Status/Doctor
after those canonical mutations. The passing Doctor above is the observed state
at this review, not a receipt for later changes. No live model subject, calibration,
Credits operation, reset or new experiment ran during this verification.
