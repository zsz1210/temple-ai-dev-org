# WI-0069 Technical Design

## Decision

Add a project-owned `usage-policy.json` contract and keep the framework schema managed. The policy separates four concerns that were previously mixed together:

1. a cold-start seed policy expressed as provider-neutral model classes;
2. project-local evidence collection and progressive calibration state;
3. Credits or monetary cost, which remain unknown until a versioned source is configured;
4. an autonomy envelope in which routine, reversible, in-scope work is automatic and only named exceptions require approval.

The current usage report remains read-only. It may expose an exploratory candidate, but it does not execute a model change. The existing count of ten qualified completed Work Items remains an observation-coverage diagnostic only. It is not statistical proof and cannot promote routing.

## Evidence basis

- OpenAI's current model guidance recommends comparing configurations on representative tasks using quality, evidence completeness, Tokens, latency, and cost rather than assuming the highest reasoning effort is best: <https://developers.openai.com/api/docs/guides/latest-model>
- NIST states that there is no correct sample size without additional assumptions such as error tolerance, variance, and decision risks: <https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm>

Temple therefore will not ship a universal numeric sample threshold for automatic routing. A project must configure its own statistical decision contract after pilot variance and meaningful quality measures exist.

## Data contract

The project policy records:

- raw-data and sharing scope;
- optimization objective;
- the task-shape dimensions required for comparison;
- provider-neutral seed rules and optional project mappings;
- calibration state and evidence requirements;
- cost provenance and the fact that Token ceilings are not financial limits;
- the default automatic decision and the exact approval triggers.

New projects receive a conservative `cold-start` and `shadow` policy. Existing projects receive the same project-owned default during upgrade only when the file is absent. Project changes are never overwritten by upgrade.

## Report behavior

`usage report` and `usage preflight` read the policy and expose:

- policy validity and source;
- calibration state;
- observation threshold state;
- statistical qualification state;
- recommendation and execution modes;
- routine approval behavior and exception triggers;
- cost provenance status.

Missing policy, missing task-shape dimensions, missing matched quality evidence, or unconfigured statistical criteria fail closed for promotion while leaving the seed policy usable. No report mutation, external write, model call, or routing action is added.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| A fixed sample count is mistaken for proof | Label it diagnostic-only and keep statistical qualification separate. |
| "Automatic" bypasses safety or authority | Limit it to routine in-envelope decisions and enumerate fail-closed approval triggers. |
| Credits are inferred from Tokens | Require a versioned source; otherwise report cost and Credits as unknown. |
| One project trains the framework for everyone | Keep raw observations project-local; organization and framework sharing are opt-in and disabled by default. |
| Seed rules become vendor lock-in | Use provider-neutral model classes; concrete mappings remain project-owned. |
| Existing repositories are overwritten | Create the project file only when absent and keep it outside `temple.lock.managed_files`. |

## Verification boundary

This Work Item adds schemas, defaults, report projections, upgrade behavior, documentation, and local tests. It does not run a live model, spend Credits, deploy, publish, enable external writes, or implement automatic model execution.
