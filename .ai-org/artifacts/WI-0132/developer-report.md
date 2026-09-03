# Developer report — WI-0132

## Delivered

- Extended the WI-0131 provider-free harness with exact Provider contract validation, one-attempt candidate execution, arm-neutral blind evaluation, frozen score evidence, and v2 analysis generation.
- Added a live protocol bound to the independently reviewed WI-0131 fixture and framework revision.
- Added data-derived reactive ceilings: 100,000 operational Tokens per candidate, 520,000 across eight candidates, 60,000 for the evaluator, 580,000 combined, and 75 minutes wall clock.
- Preserved zero retry, zero fallback, disabled candidate network access, allowlisted commands, scoped writes, model acknowledgement, detailed usage, and immediate stop on reroute or protocol violation.
- Kept the exact owner approval record intentionally absent. No model generation occurred during implementation or preflight.

## Verification

At revision `b7263e5cc64a1f3c5e93a32d2ae10a356074227d`:

- the live protocol validated with digest `84d30df16d72bfbae6ac1d111729ddab9e90d761c46a8694250955985028bc45`;
- eight fresh repositories were created and all six Temple candidates passed native Lean, bounded-scope, low-risk, route, context, and treatment-hiding checks;
- the installed Codex CLI, ten App Server schema digests, Terra medium/high, Luna max, and Sol xhigh passed the no-generation handshake;
- preflight reported only `exact-owner-approval-required`;
- `npm run verify` passed repository, documentation, package, and all 350 behavioral tests.

## Remaining boundary

The repository owner must explicitly accept the exact protocol digest, models, included Pro allowance, and resource envelope before the single live attempt. The runner cannot use this report or the earlier WI-0130 approval as authorization.
