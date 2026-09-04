# Risk review — WI-0132

## Decision

Proceed only after exact owner approval and a passing no-generation Provider handshake.

## Controls

- Included Pro allowance only; no purchased Credits and no automatic reload.
- Eight candidate turns and one evaluator turn, with zero retry and zero fallback.
- Sequential execution prevents concurrency from contaminating latency and resource observations.
- Each candidate uses an ephemeral Provider thread, workspace-write sandbox limited to its repository, and disabled network access.
- Candidate commands are allowlisted; runtime permission requests, model reroutes, out-of-scope writes, missing usage, or dirty terminal state stop the experiment.
- The evaluator is read-only and cannot execute commands, edit files, or call MCP tools.
- Raw prompts, raw responses, and hidden reasoning are not retained in canonical evidence.
- Results remain diagnostic and cannot authorize routing changes or publication.

## Residual risks

- Reactive Token interrupts are not a financial guarantee.
- Effective turn reasoning effort is recorded only if the installed Provider exposes it.
- Two cases cannot support statistical or framework-wide conclusions.
- Luna max and Sol xhigh change both model and effort, so their comparison is a route-bundle result.
- Provider availability and included account allowance can change after preflight.
