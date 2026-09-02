# WI-0112 Independent QA report

## Verdict

**Pass for bounded-stop integrity; no-go for experiment completion.**

Independent QA used a second fresh detached worktree at exact launch revision `a836643ab9aae4b0690bedae2b2c15ef98b0695e`. The Developer identity is Rikku (`agent-rikku`); Independent QA is Lulu (`agent-lulu`).

## Independently reproduced evidence

- All 20 focused replay and validation-program tests pass.
- Full repository verification passes 288/288 tests.
- The retained coordinator state records one launch, zero completions, 106,646 observed Tokens, and `per-turn-token-hard-limit`.
- The first candidate has two Git-visible allowlisted modifications; the other three candidates remain clean.
- Diagnostic checks against the interrupted state pass three public and three held-out tests, but no completed terminal, exact candidate commit, or blind package exists.
- No command-policy violation, retry, fallback, reset redemption, deployment, release, publication, or external write occurred.

## Acceptance assessment

The safety and truthful-evidence criteria pass. The experiment-completion criteria do not: the first turn exceeded its Token limit and the remaining three turns were never launched. The interrupted candidate cannot be promoted into a comparison result.

The zero disk-delta counter is not trustworthy as a no-change signal for interrupted turns because Git shows two modified files. This limitation is preserved rather than normalized away.

## Boundary

WI-0112 cannot be resumed. Raising the Token ceiling, changing reasoning effort, redeeming the available reset, or running another comparison requires separate analysis and explicit authority.
