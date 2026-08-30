# Dashboard review inventory — WI-0043

## Evidence boundary

This initial inventory uses the live Mac Mini Dashboard reached through the exact home-LAN listener at desktop and 420px widths, semantic browser snapshots, socket and API inspection, and the accepted contracts from WI-0034, WI-0036, WI-0040, WI-0041, and WI-0042. It is a review input, not a redesign specification.

## What already works

- Snapshot freshness is visibly separate from stream connectivity; stale data cannot silently appear current.
- Current work and terminal history are separated.
- Private viewers expose no Human Inbox, Agent Commands, session secret, or raw event payload.
- Token and monetary fields stay `unknown` when provider evidence is missing instead of inventing savings or cost.
- Work Items retain canonical lifecycle, task, evidence, and revision context through expandable details.
- Desktop and 420px layouts have no horizontal page overflow and no browser console errors.

These are invariants for any later redesign.

## Verified findings

| Priority | Finding | Evidence | Operator impact |
| --- | --- | --- | --- |
| P1 | “Needs attention now” mixes release approvals, stale evidence, and recovery signals without a clear action order. | The first viewport shows multiple approval cards followed by a collapsed set of additional evidence and recovery signals. | An operator must interpret lifecycle semantics before knowing what to do first. |
| P1 | The page does not answer “which Agent is doing what, with which model, right now?” near the top. | Overview exposes counts; Agent, task, model, and Work Item relationships require deeper inspection, and current model evidence may be absent. | The Dashboard underserves its central AI-organization observation goal. |
| P1 | The tablet experience is readable but very long. | At 420px, overview, attention, usage, Work Items, providers, conditions, and timeline stack vertically. | Frequent status checks require substantial scrolling and memory of section order. |
| P1 | The usage panel is visually prominent even when no detailed usage exists. | It renders six headline metrics, composition, drivers, and a long caveat while every primary value is unknown or unqualified. | Missing data competes with actionable operational state. |
| P2 | Ten overview metrics create an orphaned second row at 1440px. | Nine cards occupy the first row and Inbox Queues sits alone beneath them. | The opening composition looks accidental and gives all metrics equal visual weight. |
| P2 | Queue labels are internally correct but not immediately explanatory. | “Active”, “QA queue”, “Approval queue”, and “Queued” require knowledge of the Observer categorization. | New operators may confuse workflow stage with urgency or ownership. |
| P2 | Historical and current diagnostic signals are visually close. | Conditions and the combined timeline expose valuable evidence, but old stale-revision records can dominate the page. | Framework validation debt can look like a live product incident. |
| P2 | The private header identifies a private network but not its transport. | The API distinguishes `private-lan` and `tailscale-serve`; the page uses one generic private label. | When debugging access, the operator cannot confirm which path the browser used. |

## Candidate hierarchy for discussion

```text
1. NOW
   health · blocked work · needs-human decisions · highest-priority action

2. EXECUTION
   active Work Items · Agent/Position · current task/turn · model evidence · handoffs

3. USAGE
   compact summary when evidence is insufficient
   expanded analysis only when qualified data exists

4. SYSTEM
   provider health · conditions · private/local transport · recovery state

5. EVIDENCE & HISTORY
   terminal Work Items · timeline · stale evidence · diagnostic detail
```

This direction uses progressive disclosure. It does not decide whether the final product should use tabs, a persistent sidebar, view presets, filters, or a single reorganized page.

## Scale considerations

- **Solo:** fastest path from opening the page to “what needs me now?”; low configuration burden.
- **Small team:** ownership, Agent/Position, handoffs, conflicts, and shared task state become first-class.
- **Enterprise:** service/repository boundaries, external tracker mappings, risk, SRE/Security signals, filtering, and aggregate views become necessary without loading every detail into one context or screen.

One information model can support all three, but one fixed layout is unlikely to serve all three equally well. View presets or role-aware defaults are candidates, not accepted decisions.

## Decision agenda

1. Is the default landing goal **operational action** (“what needs me now?”) or **executive overview** (“how is the organization doing?”)?
2. Should solo, team, and enterprise users share one layout with progressive disclosure, or receive saved/default views over the same data?
3. Which conditions deserve the word “attention”, and which belong only in evidence history?
4. When Token evidence is insufficient, should Usage collapse to one summary card or remain a full educational section?
5. How prominently should the Agent → Position → Work Item → task → model chain appear?
6. Should desktop and tablet use section navigation, tabs, or a compact sticky summary to avoid long-page scanning?
7. Which outcomes will validate an improvement: time to identify the next action, scroll distance, false-attention rate, task-state comprehension, or another measurable behavior?

## Suggested next discussion

Start with decisions 1 and 5. They determine the rest of the hierarchy: whether the Dashboard is primarily an operational cockpit and how directly it represents the AI development organization. Do not discuss colors or component polish before those two decisions are stable.
