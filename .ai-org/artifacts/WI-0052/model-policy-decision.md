# Temple development model preference

- Confirmed by: human project owner
- Date: 2026-08-31
- Applies to: development of the Temple repository itself
- Does not apply to: every project initialized from the Temple framework

## Decision

Temple repository work should normally use the GPT-5.6 model family.

- Lightweight, bounded, low-risk work prefers `gpt-5.6-luna`.
- Other work must explicitly select an appropriate GPT-5.6 model; this decision does not yet automate the choice between Terra and Sol.
- A different family requires an explicit task-level exception and must remain visible as requested and effective model evidence.

This aligns with the current official [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model), while the project owner's decision—not the vendor description—is the authority for this repository preference.

## Current enforcement boundary

`WI-0052` records the requested model and passes it to Codex App Server. It does not classify task weight, enforce a model allowlist, silently substitute a model, or claim that the requested model became the effective model. Those behaviors require the later model-policy slice and representative evaluation evidence.

The separately authorized lightweight live proof should therefore request `gpt-5.6-luna`. No live proof or model call is authorized by this decision record.
