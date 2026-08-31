# Work order — WI-0077

## Problem

Temple Workspace has grown from a read-only Dashboard into a human-facing Management Console that exposes Work Items, organizational roles, Agent and Human governance, models, Token evidence, system health, and historical evidence. Those capabilities arrived through bounded slices. The resulting Console must now be reviewed as one operating experience instead of as a collection of individually correct panels.

The current repository provides useful real-world review data: completed, active, blocked, test, specification, and Release Gate Work Items coexist with historical Worker failures, collaboration validation levels, unknown cost evidence, and private-viewer restrictions. A successful Console must help a human understand that state without first learning Temple's internal schemas.

## Authorized outcome

- Audit the complete current Console at wide desktop, ordinary desktop, tablet, and mobile widths.
- Research current operations-console, dashboard, responsive-navigation, accessibility, and progressive-disclosure guidance.
- Separate verified usability problems, retained safety invariants, owner preferences, unavailable evidence, and future ideas.
- Define the primary operating questions, navigation model, information hierarchy, state semantics, and responsive behavior for Solo, Collaborative, and Enterprise use.
- Produce preview-first design artifacts for the highest-risk states and a measurable usability-validation plan.
- Propose small implementation slices for later authorization.

## Retained invariants

- The Console is for humans; canonical repository state remains authoritative.
- Missing model, Token, cost, provider, or execution evidence remains unknown rather than inferred.
- Attention, historical evidence, and current incidents remain distinguishable.
- Private viewers cannot gain command authority or receive locally restricted data.
- Agent Identity, Position, Assignment, Human Principal, sponsorship, and authority remain distinct.
- The accepted dark engineering shell and position-first Team map in `UI-0002@ui-1` are the design baseline, not a constraint against improving hierarchy or navigation.

## Excluded work

- No production Console code changes.
- No remote control or Agent Command authority expansion.
- No new provider integration, telemetry collection, analytics instrumentation, deployment, release, publication, or open-source preparation.
- No claim that simulated collaboration proves a real multi-human environment.

## Stop condition

Stop after an evidence-backed review, a coherent proposed information architecture, responsive preview artifacts, and a prioritized validation and implementation plan are ready for explicit owner review. Do not enter Build without a separately authorized implementation Work Item.
