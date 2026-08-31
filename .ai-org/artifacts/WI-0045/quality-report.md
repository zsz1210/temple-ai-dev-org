# Quality report — WI-0045

- Candidate revision: `fbb6aa965baf1f7bbd6e4721e9735ddd4d882bbe`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Decision: pass and proceed to Eval

## Independent test environment

Quality created a fresh detached Git worktree at the exact candidate revision and linked only the repository's existing dependency directory. The candidate did not include the main worktree's later lifecycle or evidence records.

- Focused Dashboard, Inbox, Observer, and private-viewer tests: 34/34 pass.
- Repository checks: pass, 93 overlay files and 10 Positions.
- Documentation links: pass.
- Complete automated suite: 222/222 pass, 0 failed, 0 skipped.
- Disposable worktree removed after verification.

## Acceptance coverage

The regression test constructs ten firing `stale-evidence` conditions together with another firing condition, a runtime permission request, and release bookkeeping. It proves that runtime permission remains first, stale evidence is represented by one bounded signal with an underlying count of ten, the signal links to System, and it appears ahead of release bookkeeping.

The revision-matched runtime observation verifies the corresponding private tablet and mobile behavior in Chromium, including System navigation, ten underlying rows, private-viewer redaction, no document-level horizontal overflow, and a clean browser console.

## Retained boundaries

No lifecycle authority, evidence content, remote command access, release status, model routing, or Token accounting is changed by this candidate.
