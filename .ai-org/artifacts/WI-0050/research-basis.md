# WI-0050 repository evidence basis

This planning slice uses existing repository decisions and validation records. It does not convert a local fixture, implementation capability, or planned test into real-environment evidence.

| Source | Evidence used | Limit retained |
|---|---|---|
| `docs/adr/0033-federate-project-authority-with-read-only-portfolios.md` | Each repository owns its canonical lifecycle; coordination is read-only and contract references are versioned. | A coordinator cannot approve, transition, close, or release a participant Work Item. |
| `docs/validation/phase-4c-completion.md` | Local federation fixtures cover exact references, compatibility waves, privacy filtering, stale inputs, and fail-closed unknowns. | No real multi-machine or enterprise federation has been qualified. |
| `docs/validation/collaborative-large-scale-test-plan.md` | Real collaboration needs multiple principals, independent environments, conflict cases, Git-hosting evidence, and cold-task recovery. | The retained test is planned and has not run. |
| `docs/operations/token-efficiency-and-model-routing.md` | Temple can normalize provider-emitted usage, attribute exact Work Item/task pairs, and keep missing data unknown. | Ten completed correlated Work Items are only an observation threshold; routing and causal savings remain disabled. |
| `docs/validation/wi-0014-active-task-usage-baseline.md` | Existing preflight distinguished task readiness from detailed Token observations. | The observed provider path produced zero detailed correlated observations and cannot support a Token claim. |
| `.ai-org/work-items/` | Current lifecycle and unresolved boundaries for all Work Items. | Chat history and titles are not used as lifecycle authority. |

## Design implications

- Start with a local instrumentation pilot because measurement itself is not yet proven end to end.
- Preserve one `.ai-org/` authority per repository and use composite `project_id + work_item_id` references.
- Treat unavailable repositories, missing usage, stale revisions, and lost task correlation as `unknown` rather than success or zero.
- Require real registered Codex task IDs for later attribution; generated plans alone do not create tasks or prove work.
- Compare accepted outcomes, defects, rework, latency, and human intervention alongside Tokens.
- Keep hosted Git, paid execution, sensitive data, production, and publication behind separate human decisions.

