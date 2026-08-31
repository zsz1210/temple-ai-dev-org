# Human-console interaction research

## Sources reviewed

- [WAI-ARIA Authoring Practices: Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [WAI-ARIA Authoring Practices: Disclosure card example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-card/)
- [Atlassian Design System components](https://atlassian.design/components/)

## Applied conclusions

1. An expandable Work Item needs a visible disclosure affordance, not only an invisible click target. Native `details` and `summary` preserve Enter and Space behavior; a chevron and explicit `View details` label explain the interaction.
2. The concise summary remains separate from the richer content. Status is shown as a short lozenge for scanning, while revision, provenance, freshness, task IDs, and evidence stay inside the expanded region.
3. Healthy refresh is ordinary metadata, not an alert. Only delayed or failed refresh needs a bordered, high-attention message.
4. Human labels describe the decision or activity: `Testing`, `Waiting for release decision`, and `Planned`. Canonical enum values remain available in technical details for traceability.
5. Normal update time appears once in the main content. Connection transport remains in the sidebar; the footer does not repeat the timestamp.

## Accessibility and motion

- Keep the native disclosure keyboard contract.
- Preserve a visible focus ring and a minimum practical target size.
- Rotate the chevron with a short CSS transition and disable the transition for reduced-motion preference.
- Do not animate content height.
