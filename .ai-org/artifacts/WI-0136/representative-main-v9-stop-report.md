# WI-0136 representative comparison v9 stopped report

## Outcome

The exact-approved v9 candidate ran once from `2026-09-03T17:22:44.641Z` to `2026-09-03T17:34:57.408Z` and stopped fail-closed during the Temple Build wave. It used 313,151 candidate Operational Tokens with zero retry and zero fallback. The blind evaluator did not start.

This is a stopped harness observation. It is not a completed Temple-versus-Minimal comparison and cannot support an effectiveness conclusion.

## Completed evidence

The Minimal Responsible arm completed in full:

| Stage | Operational Tokens | Result |
|---|---:|---|
| Design | 91,858 | Completed |
| Orders and Catalog Build | 36,858 | Completed |
| Notifications Build | 20,927 | Completed |
| Gateway Build | 19,721 | Completed |
| Cold Integration | 60,819 | Completed |

All Minimal service tests, public integration tests, and held-out tests passed. The cold Integration recovered all four exact revisions, all three slices, the governing contract, unresolved state, and a bounded next action.

Temple Design then completed at 61,414 Operational Tokens. During the three-way Temple Build wave, Notifications requested the framework-required Coordinator Context Capsule command. The retained event summary identifies one `unknown` action, while the command display contains a `/bin/zsh -lc` wrapper. The same inner command passes the v9 predicate in generation-free reproduction, so the evidence supports a wrapper-shape mismatch as the root cause; the raw action text was intentionally not retained. Gateway was interrupted as a sibling at 651 Operational Tokens; Notifications retained 20,903. Orders and Catalog stopped before detailed usage was available and therefore produced no stage observation.

Every generated repository was clean after settled sibling interruption, and no App Server child remained for the experiment.

## Root cause and correction boundary

The v9 end-to-end readiness gate proved production orchestration, lifecycle mutation, parallel settlement, objective tests, blind packaging, evaluator freezing, and reporting with a generation-free Provider double. It did not replay the observed schema-valid combination of an `unknown` CommandAction and a shell-wrapped command display.

The successor must normalize at most one exact single-quoted `/bin/zsh -lc` wrapper, then reapply the existing inner-command prefix, shell-control, parent-path, cwd, and exact Git-target policies. Ambiguous wrappers, nested quoting, control operators, escapes, network commands, and out-of-arm working directories remain rejected. The exact wrapped Context Capsule event must become part of Harness Readiness evidence before another approval is requested.
