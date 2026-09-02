# Offline preparation report — WI-0117

- Candidate model: GPT-5.6 Luna Medium
- Candidate turns: 4
- Independent evaluator turns: 1
- Model generation so far: **none**

The fresh Wave 5B lab was created at `/Users/zsz1210/Documents/ChatGPT/temple-wave-5b-lab`. Four candidate repositories are clean and pinned to the frozen case fixtures and integrated Temple revision. The exact installed Codex CLI and all ten required App Server schema digests match the protocol preflight; model discovery confirms Luna Medium.

The first setup iteration was rejected because evaluator-only fields appeared in the candidate validation manifest. The failed lab was preserved as `/Users/zsz1210/Documents/ChatGPT/temple-wave-5b-lab.preflight-invalid-20260903`; the protocol now separates candidate, evaluator, and combined limits. The second clean lab passes every offline candidate check except the intentionally absent owner approval.

The evaluator preflight passes its no-generation protocol checks and reports zero blind packages, which is the correct state before the four candidates run. Nine focused offline tests pass, including adversarial mapping exposure, score ordering, score identity, sanitization, and custom-protocol setup.

No purchased Credits, reset, deployment, release, publication, network access, or external write occurred. The next action is one explicit approval for the fixed five-turn envelope; ordinary continuation after that approval is automatic unless a terminal safety stop occurs.
