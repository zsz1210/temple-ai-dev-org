# Quality test report — WI-0037

- Candidate revision: `2b48a14aca01c0e98200c0b0424fb5b47636f9fc`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Result: **pass to Eval**

## Counterexamples checked

1. **Core listener removed too early:** the signal-latch test proves both listeners remain installed after the first signal, repeated `SIGINT` and `SIGTERM` preserve the first request, and disposal removes both listeners exactly once.
2. **Project launcher exits before cleanup:** the launcher integration test signals the parent twice while its child performs delayed cleanup. The cleanup marker exists before the parent reports exit status 0.
3. **Launcher hides failures:** existing launcher tests still preserve missing, version-mismatch, and escaped-path failures as status 1; signal termination has explicit status mapping.
4. **Private-viewer boundary regresses:** the private-viewer suite continues to fail closed for invalid host, version, Serve, Funnel, redaction, and mutation cases.

The fresh focused run passed 40/40 with zero failures, skips, cancellations, or TODOs. The affected implementation and launcher paths remain byte-identical to the candidate revision; lifecycle artifacts do not alter them.

## Live evidence assessed

Developer runtime evidence reproduced the exact previously failing route through `templew.mjs`: process exit 0, empty Tailscale Serve status, and a closed former loopback port. The scope is one macOS self-host environment with Tailscale CLI 1.98.8. It does not establish crash recovery after `SIGKILL`, unattended startup, public exposure, or release readiness.
