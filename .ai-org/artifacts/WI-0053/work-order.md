# Work order: Temple self-development model selection policy

## Objective

Convert the user's confirmed model-selection arrangement into durable project-owned policy for development of the Temple repository itself.

## Confirmed policy direction

- Use only the GPT-5.6 family by default for model-backed Temple work.
- Use `gpt-5.6-sol` with `xhigh` reasoning for consequential planning, architecture, security, migrations, and high-risk judgment.
- Use `gpt-5.6-terra` with `medium` or `high` reasoning for ordinary implementation, analysis, and broad exploration.
- Use `gpt-5.6-luna` with `max` reasoning for bounded lightweight tasks where quality still matters and the task is easy to verify.
- Use `gpt-5.6-luna` with `medium` or `low` reasoning, or no model at all, for mechanical transformations and deterministic checks.

## Boundary

This Work Item documents a manual advisory policy. It does not:

- change framework-managed template defaults;
- modify repository custom-Agent model configuration;
- enable automatic routing or fallback;
- create a real task or model call;
- compare Token, quality, latency, or cost outcomes;
- push, publish, deploy, or release anything.

## Required evidence

- accepted Decision Ledger entry;
- reconciled human-facing operations guidance;
- full local verification and Doctor;
- fresh-checkout Independent QA by an Agent Identity distinct from the Developer.
