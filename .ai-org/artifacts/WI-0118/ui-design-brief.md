# UI design brief — WI-0118

- Owner: UI Designer Position
- Delivery mode: `code-first`
- Surface: read-only Management Console
- Goal: make workflow profile and lifecycle outcome understandable without adding a new navigation destination or increasing dashboard density.

## Human language

- Use **Organization profile** for Solo, Collaborative, or High-Assurance organization configuration.
- Use **Workflow profile** for Lean, Standard, or High-Assurance delivery on one Work Item.
- Use **Blocked** only for work that needs resolution before it can continue.
- Use **Accepted**, **No-go**, **Inconclusive**, and **Cancelled** as historical outcomes.
- Label model recommendations **Advisory** and keep them separate from observed requested/effective models.

## Required state coverage

1. One actionable blocked item remains in Work and current attention.
2. A concluded no-go item appears in History and not in current attention.
3. A concluded inconclusive item appears in History with its distinct outcome label.
4. A legacy release-gate no-go record projects as concluded before explicit migration and remains visibly truthful.
5. Lean, Standard, and High-Assurance Work Items show a compact Workflow profile field in Work detail.
6. Missing legacy profile data displays Standard without rewriting the record.
7. Private viewer receives the same lifecycle meaning without exposing private identities, commands, or raw events.
8. Desktop wide, desktop standard, tablet, and narrow layouts retain readable labels without horizontal overflow.

## Interaction and layout boundary

Reuse the existing Work filters, detail panel, History filters, status badges, and responsive shell. Do not add an editable profile control: the Console remains read-only. Outcome filtering must be keyboard accessible and must not change focus during live refresh.

## Runtime review plan

After implementation, start the real Console against repository data and verify all required states at wide desktop, standard desktop, tablet, and narrow widths. Record screenshots or a browser observation with the exact candidate revision. Passing string assertions alone is insufficient.
