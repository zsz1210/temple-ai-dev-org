# WI-0180 — Optional installed-provider test prerequisites

This bounded test-only follow-up is within the maintainer's request to prepare and compare reliably. The parent WI-0179 remains paused without live-run approval. The npm Release workflow runs the full suite on Ubuntu without Codex CLI or zsh. Its portable contract checks must not acquire an undeclared dependency on those optional host tools.

Change only the integration test's prerequisite declaration. Without installed Codex and zsh, label that local integration as skipped, not passed; all portable policy, matrix, oracle and framework tests remain available. When `TEMPLE_DELIVERY_SANDBOX_REPORT` explicitly requests an installed-sandbox rehearsal, missing tools must fail instead of skip. Keep model-generation authority, actor prompts, production runner and command policy unchanged.

Acceptance: current installed-Codex local replay still passes; a child test process with no executable lookup path explicitly reports the integration skip; explicit sandbox invocation under that missing-tools environment fails; full local verification remains passing. Preserve the existing wrong-claim, budget, wire, source and write-boundary counterexamples whenever the integration prerequisites are available.

Low-risk bounded Lean, no UI or external action. Mog integrates, Rikku implements and Lulu evaluates. No formal Independent QA claim is implied by Lean; the parent's separate reviewer checks the delta before the matrix is rebound. Rollback is a normal revert of this test-only change. Stop at exact evidence and parent reintegration; do not start model turns, merge, publish or alter CI.
