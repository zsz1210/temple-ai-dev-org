# WI-0080 Diagram Candidate Research Notes

Candidate: `temple-overview-c4.zh-TW.svg`

## Design basis

- C4 System Context diagrams put one system in the center and show only directly related people and external systems at the zoomed-out level.
- Structurizr uses a deliberately constrained notation of boxes, boundaries, and unidirectional arrows; relationship direction and labels should remove ambiguity.
- Mermaid Architecture diagrams organize services into groups and connect them with directed edges, which reinforces the value of explicit system boundaries over a flat concept list.
- D2 confirms that containers, adaptive dark mode, and diagram-as-code are useful implementation qualities, but this candidate does not add D2 or another runtime dependency.

## Temple adaptation

This is C4-inspired rather than a literal C4 software-system model. Temple is a repository-installed framework layer, so the central boundary exposes four functional mechanisms while the outer context shows the Human Principal, human and AI executors, and the project repository. Existing trackers and design tools are intentionally omitted from the first-view diagram to reduce cognitive load.

## Sources

- https://c4model.com/diagrams/system-context
- https://docs.structurizr.com/server/diagrams/notation
- https://mermaid.js.org/syntax/architecture.html
- https://d2lang.com/
