# WI-0136 context-recovery qualification v9 stopped report

## Outcome

V9 proved that both context treatments were executable and successfully observed, but the full-load candidate was interrupted by an overly narrow command allowlist before it could complete recovery. The run does not support an efficiency comparison.

- Protocol SHA-256: `6ad30fd488aa57c0bc3318161a2f00b7cb7ade97b20e1fcbaffedc5bd0e81715`
- Observed conditions: 2 of 2
- Completed conditions: 1
- Stopped conditions: 1
- Routed recovery: passed, 50,255 Operational Tokens
- Full-load recovery: stopped, 19,892 Operational Tokens
- Combined Operational Tokens: 70,147
- Retry and fallback: 0
- Preserved raw stopped record SHA-256: `c2823de34c24b5a267e8198faa208bb7b550d731d724ecd93bfb652cfab3a709`

Both candidates requested `gpt-5.6-terra` with medium reasoning. Both threads reported high reasoning; effective per-turn effort remained unavailable.

## Treatment evidence

The routed candidate recorded one successful `context-resolve` completion and no `TEMPLE.md` read. It recovered all four exact revisions, the governing contract, all three slice IDs, unresolved work, and a bounded next action.

The full-load candidate recorded the required successful sequence:

1. `temple-md`
2. `context-resolve`

This confirms that the v9 path, local CLI environment, and exit-code-qualified observer repairs worked.

## Stop cause

After the successful treatment, the full-load candidate used the read-only Git command `git -C gateway rev-parse HEAD`. The comparison allowlist accepted `git rev-parse` but not the equivalent repository-scoped `git -C` form, so the runner stopped the condition with a command-policy violation. This is a harness-policy false positive, not a recovery-quality result.

## Interpretation boundary

The 50,255-versus-19,892 values are not comparable. The full-load condition ended before structured completion and has no objective recovery result. V9 validates treatment delivery and observation only; it does not measure the relative efficiency of routed and full-load context.

## Corrective action

V10 permits the existing read-only Git subcommands only when `-C` names one of the five fixture repositories: Gateway, Catalog, Orders, Notifications, or Coordinator. Traversal targets and unapproved Git subcommands remain rejected. Generation-free preflight validates the expected `git -C <fixture> rev-parse HEAD` form for both conditions and every fixture repository.
