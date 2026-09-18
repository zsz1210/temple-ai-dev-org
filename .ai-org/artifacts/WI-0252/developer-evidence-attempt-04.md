# Exact-HEAD authority correction

Candidate: `8f7ab5f0b4455dda0d51cb0a1e79ea3b72978462`.

Protected gate resolution and physical comparison now precede the exact-HEAD
return. The same check covers Developer, Verifier and identical-request recovery.
A dedicated regression exercises both first Developer delivery and Verifier
acceptance at exact HEAD, with plain dirty bytes, assume-unchanged and skip-worktree.
All reject without Work Item/event writes; restoring approved bytes permits normal
delivery or acceptance. The descendant checks from the prior correction remain.
The named recovery-output pattern also preserves the full supported operation-ID
length rather than counting its `recovery-` filename prefix against the ID bound.

Collaboration regressions: 8/8 passed, 19,339.191 ms runner duration. Documentation
links and package check passed: 451 files, 1,017,971 packed bytes, 3,950,084 unpacked
bytes. No unrelated runtime modules or policies changed.

This time the independent narrow review runs before the final full suite. If it
accepts this exact candidate, run the complete suite on that unchanged candidate
before PR readiness. Earlier full passes remain superseded by the documented QA
findings. Raw captured logs preserve their original whitespace; source/evidence
Markdown diff checks exclude only those literal `.log` outputs.
