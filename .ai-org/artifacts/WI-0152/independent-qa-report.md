# WI-0152 Independent QA Report

Candidate revision: `b7e1706f01d343738d63594cba79e3b48728b87b`

Independent QA: Lulu (`agent-lulu`)

Developer: Rikku (`agent-rikku`)

## Verdict

**Pass for organizational closeout.** The exact candidate implements the approved Auditable Self-Hosting capability and keeps publication authority outside the command.

## Independent checks

- Reproduced the fast repository gate from a fresh detached worktree: 30 passed, 0 failed.
- Ran the focused publication and installation/upgrade suite: 10 passed, 0 failed.
- Confirmed the detached worktree remained clean after every read-only audit.
- Confirmed the npm package surface is `allowed`: 370 files, 0 blocked, 0 review-required.
- Confirmed the repository surface has 0 blockers and truthfully remains `review-required` for 334 retained legacy environment occurrences plus 68 binary files.
- Confirmed Doctor reports 36 pass, the known stale generated parallel-plan warning, and 0 failures.

## Adversarial conclusions

1. A reviewed repository baseline cannot exempt package files.
2. Adding another copy of a baseline value exceeds the counted allowance and blocks.
3. Credentials and high-confidence secret material block even under the private profile.
4. Audit reports retain paths, classifications, counts, and remediation but not matched values, source lines, or stored fingerprints.
5. Missing or unsafe inspection conditions fail closed; binary material is never silently certified.
6. Project-owned profile configuration survives upgrade and cannot lower built-in safety floors.

## Residual risk

This is a bounded prevention and review aid, not a security certification. Before changing repository visibility, a Human must separately review the 402 repository obligations, full Git history, hosted logs, dependency/license posture, and GitHub settings. That future decision is deliberately outside WI-0152.

