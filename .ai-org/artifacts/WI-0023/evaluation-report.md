# Evaluation report — WI-0023

Independent QA must check out exact candidate `db40145cee3f1ca7bfa3925cdfcfeb38b8844b9b` in a fresh worktree and recreate commits A/B plus `git replace A B`. QA must confirm the production federation path never projects B under provenance A, then rerun focused federation tests, full verification, Doctor, `git diff --check`, and the final clean-worktree check. Real multi-machine trust and remote attestation remain outside this local correction.
