# Required state coverage — WI-0077

This document maps the highest-risk states to the draft preview. Coverage here means represented for owner review, not production-tested behavior.

| State | Preview location | Intended interpretation |
| --- | --- | --- |
| Open lifecycle work with no active claim or Worker | Overview metrics | `Open work: 8` and `Running now: 0` can both be true. |
| Current human decision | Overview → Needs you now | The WI-0077 design review has a consequence and owner. |
| Intentionally retained blocked validation | Overview → Follow-up | WI-0064 and WI-0067 remain important without stopping WI-0077. |
| Lifecycle, execution, and impediment separation | Work → selected WI-0077 detail | A Work Item may be in Spec, unclaimed, and clear at the same time. |
| Agent, Position, Work Item, Codex task, and model chain | Work → selected WI-0077 detail | Responsibility and evidence are inspectable without duplicating every chain in the list. |
| One Agent covering several Positions | Team → Responsibilities | Solo staffing is visible without turning Positions into Agent names. |
| Developer and Independent QA identity separation | Team → Assurance & Operations | Rikku is Developer; Lulu is Independent QA. |
| Recorded model evidence | Usage and Team examples | `gpt-5.6-luna` is shown only for the preserved observation; missing effective model remains `Not recorded`. |
| Insufficient trend evidence | Usage → Trend and task-type share | No time-series or optimization claim is fabricated from one observation. |
| Unknown cost | Usage → Recorded cost | Missing versioned pricing remains unknown. |
| Current system limitation | System → Codex task observation | Human impact appears before raw provider state. |
| Historical no-go evidence | History → Finished work | A prior failure is retrievable without becoming a live incident. |
| Read-only private viewer | Global header and System | Access mode is persistent; no local command tools are present. |
| Historical running replay | Overview → scenario selector and Work moving | One restrained activity indicator demonstrates runtime treatment without asserting that WI-0056 is currently running. |
| Fresh projection acknowledgement | Overview → `Scenario: just updated` | A one-time highlight confirms the refresh; the interface does not keep moving after acknowledgement. |
| View-only effective configuration | System → Configuration | Human-readable values show source and operational effect without exposing mutation controls or requiring canonical JSON knowledge. |
| Reduced-motion preference | Running replay | Activity animation is removed while state labels and semantic color remain understandable. |

## Deferred states

- A real dependency-blocking Work Item affecting the current objective.
- High Assurance evidence and Human Principal approval detail.
- Several concurrent Workers and conflicting shared resources beyond the single historical replay.
- A statistically qualified usage trend.
- Large-volume History pagination backed by production data.
- Local Action Center behavior in operator mode.

These states require deterministic fixtures or later implementation. They must not be inferred from this interactive design preview.
