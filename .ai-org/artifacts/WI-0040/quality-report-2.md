# Quality report — WI-0040 corrected candidate

- Candidate revision: `660f397a6f17c805ec2ef0467d27c8a53ca28134`
- Evaluator: Lulu (`agent-lulu`), Quality & Evaluation Engineer
- Decision: pass Test and Eval after the WI-0041 correction

The initial `9de63df` usage-panel candidate passed automated tests but failed real Chromium evaluation because historical SSE replay triggered an unbounded snapshot-fetch stampede. The bounded child WI-0041 corrected that counterexample without changing usage semantics, private-viewer authority, Agent Commands, or server protocol.

At the corrected candidate:

- focused control-plane regression passed 27/27;
- full repository verification passed 218/218;
- live local desktop, local 420px, and private tablet views reached `Snapshot current` with 0 console errors and no horizontal overflow;
- the private surface exposed neither Inbox nor Agent Commands;
- real project usage remained honestly unqualified: Tokens and cost unknown, 0 observations, 0/10 qualified Work Items, 2/28 registered completed Work Items, and no model, savings, quality, routing, or automatic-switching claim.

The detailed counterexample, screenshot digests, and refresh behavior are recorded in `.ai-org/artifacts/WI-0041/evaluation-report.md`.
